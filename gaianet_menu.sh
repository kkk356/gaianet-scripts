#!/bin/bash

# 交互式菜单脚本

# 主菜单
show_menu() {
    echo "请选择要执行的操作:"
    echo "1. 部署 Gaia 节点"
    echo "2. 查看节点 URL"
    echo "3. 备份节点信息"
    echo "4. 生成节点邀请链接（必须先运行1）"
    echo "5. 退出"
}

# 1. 部署 Gaia 节点
deploy_gaia_node() {
    echo "正在下载并安装 Gaia 节点..."
    curl -sSfL 'https://github.com/GaiaNet-AI/gaianet-node/releases/latest/download/install.sh' | bash

    if [ $? -ne 0 ]; then
        echo "安装失败，请检查网络连接或重试。"
        return
    fi

    echo "正在设置环境变量..."
    source $HOME/.gaianet/env

    echo "正在初始化 Gaia 节点（这可能会花费一些时间，因为需要下载大型 LLM 文件）..."
    gaianet init

    if [ $? -ne 0 ]; then
        echo "初始化失败，请检查配置或重试。"
        return
    fi

    echo "正在启动 Gaia 节点..."
    gaianet start

    if [ $? -ne 0 ]; then
        echo "启动失败，请检查日志或重试。"
        return
    fi

    echo "节点启动成功！"
    echo "节点 URL:"
    cat $HOME/.gaianet/node_url
}

# 2. 查看节点 URL
show_node_url() {
    if [ -f "$HOME/.gaianet/node_url" ]; then
        echo "节点 URL:"
        cat $HOME/.gaianet/node_url
    else
        echo "未找到节点 URL，请先部署 Gaia 节点。"
    fi
}

# 3. 备份节点信息
backup_node_info() {
    if [ -d "$HOME/.gaianet" ]; then
        tar -czf gaianet_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C $HOME .gaianet
        echo "节点信息已备份到当前目录。"
    else
        echo "未找到节点信息，请先部署 Gaia 节点。"
    fi
}

# 4. 生成节点邀请链接
generate_invite_link() {
    if [ -f "$HOME/.gaianet/node_url" ]; then
        node_url=$(cat $HOME/.gaianet/node_url)
        echo "节点邀请链接：${node_url}/invite"
    else
        echo "未找到节点 URL，请先部署 Gaia 节点。"
    fi
}

# 主循环
while true; do
    show_menu
    read -p "请输入选项（1-5）：" choice
    case $choice in
        1) deploy_gaia_node ;;
        2) show_node_url ;;
        3) backup_node_info ;;
        4) generate_invite_link ;;
        5) echo "退出脚本。"; break ;;
        *) echo "无效选项，请重新输入。" ;;
    esac
    echo
done