#!/bin/bash

# 初始化变量
prev_recv=0
prev_sent=0
first=1

# 添加退出处理
trap 'echo "监控已停止"; exit 0' INT TERM

while true; do
    # 获取当前时间
    now=$(date)
    
    # 获取网络数据包信息，添加错误处理
    if ! read curr_recv curr_sent <<< $(get_tcp_packets 2>/dev/null); then
        echo "错误：无法获取网络数据包信息"
        sleep 10
        continue
    fi
    
    # 检查获取的值是否为空
    if [ -z "$curr_recv" ] || [ -z "$curr_sent" ]; then
        echo "错误：获取的网络数据为空"
        sleep 10
        continue
    fi
    
    # 第一次运行时的处理
    if [ $first -eq 1 ]; then
        prev_recv=$curr_recv
        prev_sent=$curr_sent
        first=0
        sleep 10
        continue
    fi
    
    # 计算差值，确保不会出现负数
    recv=$((curr_recv - prev_recv))
    sent=$((curr_sent - prev_sent))
    
    # 检查计算结果是否有效
    if [ -z "$recv" ] || [ -z "$sent" ]; then
        echo "错误：计算结果无效"
        sleep 10
        continue
    fi
    
    # 计算总和
    total=$((sent + recv))
    
    # 输出结果
    printf "%s 接收: %d 发送: %d 总计: %d\n" "$now" "$recv" "$sent" "$total"
    
    # 更新上一次的值
    prev_recv=$curr_recv
    prev_sent=$curr_sent
    
    # 等待10秒
    sleep 10
done 