#!/bin/bash

# 清理报告脚本
# 用于删除测试过程中生成的临时报告，只保留有意义的报告

echo "🧹 开始清理测试报告..."

# 进入项目目录
cd "$(dirname "$0")"

# 删除所有报告文件（除了最新的几个）
echo "📁 清理 reports/ 目录..."

# 保留最新的3个报告，删除其他的
if [ -d "reports" ]; then
    cd reports/
    # 按时间排序，保留最新的3个报告
    latest_reports=$(ls -t report-*.json 2>/dev/null | head -3)
    
    if [ -n "$latest_reports" ]; then
        echo "✅ 保留最新的报告:"
        echo "$latest_reports" | while read report; do
            echo "  📄 $report"
        done
        
        # 删除其他报告
        all_reports=$(ls report-*.json 2>/dev/null)
        for report in $all_reports; do
            if ! echo "$latest_reports" | grep -q "$report"; then
                echo "🗑️  删除: $report"
                rm -f "$report"
                # 同时删除对应的txt文件
                txt_file="${report%.json}.txt"
                if [ -f "$txt_file" ]; then
                    echo "🗑️  删除: $txt_file"
                    rm -f "$txt_file"
                fi
            fi
        done
    else
        echo "ℹ️  没有找到报告文件"
    fi
else
    echo "ℹ️  reports/ 目录不存在"
fi

# 保留progress_history.json文件
echo "✅ 保留进度历史文件: progress_history.json"

echo "🎉 报告清理完成！"
echo ""
echo "📊 当前报告文件:"
ls -la reports/ 2>/dev/null || echo "  (无报告文件)"

echo ""
echo "💡 提示:"
echo "  - 定时任务会在每天早上7点生成正式报告"
echo "  - 测试时生成的报告会被自动清理"
echo "  - 只保留最新的3个报告文件" 