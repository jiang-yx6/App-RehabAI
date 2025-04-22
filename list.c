#include<stdio.h>
#include<dirent.h>
#include<errno.h>
#include<stdlib.h>
#include<string.h>
#include<sys/stat.h>
#include<time.h>
#include<pwd.h>
#include<grp.h>
#include<unistd.h>

// 定义选项标志
#define OPT_RECURSIVE 0x01  // -r 递归遍历目录
#define OPT_ALL      0x02  // -a 显示所有文件（包括以.开头的文件）
#define OPT_SIZE_MIN 0x04  // -l 限制文件大小最小值
#define OPT_SIZE_MAX 0x08  // -h 限制文件大小最大值
#define OPT_TIME_MOD 0x10  // -m 限制最近修改时间

// 全局变量
unsigned int options = 0;
off_t min_size = 0;        // 最小文件大小
off_t max_size = -1;       // 最大文件大小（-1表示无限制）
time_t mod_time = 0;       // 修改时间限制（秒）

// 获取文件类型字符串
const char* getFileType(unsigned char d_type) {
    switch(d_type) {
        case DT_REG:  return "Regular file";
        case DT_DIR:  return "Directory";
        case DT_LNK:  return "Symbolic link";
        case DT_BLK:  return "Block device";
        case DT_CHR:  return "Character device";
        case DT_FIFO: return "FIFO";
        case DT_SOCK: return "Socket";
        default:      return "Unknown";
    }
}

// 获取文件权限字符串
void getPermissionStr(mode_t mode, char *perm) {
    strcpy(perm, "----------");
    if(S_ISDIR(mode)) perm[0] = 'd';
    if(S_ISLNK(mode)) perm[0] = 'l';
    
    if(mode & S_IRUSR) perm[1] = 'r';
    if(mode & S_IWUSR) perm[2] = 'w';
    if(mode & S_IXUSR) perm[3] = 'x';
    
    if(mode & S_IRGRP) perm[4] = 'r';
    if(mode & S_IWGRP) perm[5] = 'w';
    if(mode & S_IXGRP) perm[6] = 'x';
    
    if(mode & S_IROTH) perm[7] = 'r';
    if(mode & S_IWOTH) perm[8] = 'w';
    if(mode & S_IXOTH) perm[9] = 'x';
}

// 检查文件是否满足筛选条件
int checkFileConditions(const struct stat *statbuf, const char *filename) {
    // 检查隐藏文件
    if (!(options & OPT_ALL) && filename[0] == '.') {
        return 0;
    }

    // 检查文件大小限制
    if ((options & OPT_SIZE_MIN) && statbuf->st_size < min_size) {
        return 0;
    }
    if ((options & OPT_SIZE_MAX) && max_size != -1 && statbuf->st_size > max_size) {
        return 0;
    }

    // 检查修改时间限制
    if ((options & OPT_TIME_MOD)) {
        time_t now = time(NULL);
        if (difftime(now, statbuf->st_mtime) > mod_time) {
            return 0;
        }
    }

    return 1;
}

void printFileInfo(const char *filepath, const struct dirent *entry) {
    struct stat statbuf;
    char perm[11];
    struct passwd *pwd;
    struct group *grp;
    char time_str[26];

    if(lstat(filepath, &statbuf) < 0) {
        fprintf(stderr, "Error getting file stats: %s\n", strerror(errno));
        return;
    }

    // 检查文件是否满足条件
    if (!checkFileConditions(&statbuf, entry->d_name)) {
        return;
    }

    // 显示inode号
    if(options & OPT_INODE) {
        printf(" %ld", entry->d_ino);
    }

    // 显示详细权限
    if(options & OPT_PERM) {
        getPermissionStr(statbuf.st_mode, perm);
        pwd = getpwuid(statbuf.st_uid);
        grp = getgrgid(statbuf.st_gid);
        printf(" %s %s %s", perm, pwd->pw_name, grp->gr_name);
    }

    // 显示文件大小
    if(options & OPT_SIZE) {
        printf(" %ld", statbuf.st_size);
    }

    // 显示时间信息
    if(options & OPT_TIME) {
        strftime(time_str, sizeof(time_str), "%Y-%m-%d %H:%M:%S", localtime(&statbuf.st_mtime));
        printf(" %s", time_str);
    }

    // 显示文件类型和名称
    printf(" %s %s\n", getFileType(entry->d_type), entry->d_name);
}

void listDirectory(char* filepath, int recursive) {
    DIR* dir;
    struct dirent* entry;
    char* new_path;
    size_t path_len;

    if((dir = opendir(filepath)) == NULL){
        printf("Open directory \"%s\": %s (ERROR %d)\n", filepath, strerror(errno), errno);
        return;
    }

    printf("\nListing directory: %s\n", filepath);
    printf("Name\tSize\tModified Time\tType\n");
    printf("------------------------------------------------\n");

    while((entry = readdir(dir)) != NULL){
        path_len = strlen(filepath) + strlen(entry->d_name) + 2;
        new_path = (char*)malloc(path_len);
        if (new_path == NULL) {
            fprintf(stderr, "Memory allocation failed\n");
            exit(1);
        }
        snprintf(new_path, path_len, "%s/%s", filepath, entry->d_name);
        
        printFileInfo(new_path, entry);

        if(recursive && entry->d_type == DT_DIR && 
           strcmp(entry->d_name,".") && strcmp(entry->d_name,"..")) {
            listDirectory(new_path, recursive);
        }
        free(new_path);
    }
    closedir(dir);
}

void printUsage(const char *progname) {
    fprintf(stderr, "Usage: %s [options] <dirname>\n", progname);
    fprintf(stderr, "Options:\n");
    fprintf(stderr, "  -r  递归遍历子目录\n");
    fprintf(stderr, "  -a  显示所有文件（包括隐藏文件）\n");
    fprintf(stderr, "  -l size  限制文件大小的最小值（字节）\n");
    fprintf(stderr, "  -h size  限制文件大小的最大值（字节）\n");
    fprintf(stderr, "  -m time  限制最近修改时间（秒）\n");
}

int main(int argc, char* argv[]) {
    int opt;
    char *endptr;
    
    while((opt = getopt(argc, argv, "ral:h:m:")) != -1) {
        switch(opt) {
            case 'r':
                options |= OPT_RECURSIVE;
                break;
            case 'a':
                options |= OPT_ALL;
                break;
            case 'l':
                options |= OPT_SIZE_MIN;
                min_size = strtol(optarg, &endptr, 10);
                if (*endptr != '\0' || min_size < 0) {
                    fprintf(stderr, "Invalid minimum size\n");
                    exit(1);
                }
                break;
            case 'h':
                options |= OPT_SIZE_MAX;
                max_size = strtol(optarg, &endptr, 10);
                if (*endptr != '\0' || max_size < 0) {
                    fprintf(stderr, "Invalid maximum size\n");
                    exit(1);
                }
                break;
            case 'm':
                options |= OPT_TIME_MOD;
                mod_time = strtol(optarg, &endptr, 10);
                if (*endptr != '\0' || mod_time < 0) {
                    fprintf(stderr, "Invalid modification time\n");
                    exit(1);
                }
                break;
            default:
                printUsage(argv[0]);
                exit(1);
        }
    }

    if(optind >= argc) {
        printUsage(argv[0]);
        exit(1);
    }

    listDirectory(argv[optind], options & OPT_RECURSIVE);
    return 0;
} 