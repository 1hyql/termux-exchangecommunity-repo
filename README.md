# Termux Exchange Community Repo

Termux Exchange Community Repo 是一个社区自营的 Termux 软件包仓库网站，提供软件包展示、搜索和一键配置功能。

## 项目简介

本项目是一个纯静态网站，用于展示和搜索 Termux 软件包。网站采用数据驱动架构，所有软件包信息从 `packages.json` 动态加载并渲染。

**技术栈**：HTML5 + CSS3 + Vanilla JavaScript，零框架依赖，零构建步骤。  
**仓库地址**：[https://1hyql.github.io/termux-exchangecommunity-repo](https://1hyql.github.io/termux-exchangecommunity-repo)

---

## 功能特点

### 1. 首页（index.html）

- **镜像源状态检测**：实时检测仓库源的可访问状态
- **安全验证**：展示 GPG 密钥指纹和公钥文件信息
- **一键配置**：提供完整的 Termux 源配置命令
- **源信息展示**：显示软件包数量、最近更新时间等

### 2. 软件包页面（package.html）

- **推荐软件**：展示特别推荐的软件包
- **全部软件包**：列出所有可用的软件包
- **快速搜索**：输入关键词可跳转到搜索结果页
- **安装命令**：每个软件包都提供复制安装命令功能

### 3. 搜索页面（search.html）

- **实时搜索**：支持软件包名称、描述、维护者、主页搜索
- **URL 参数支持**：`search.html?q=关键词` 直接访问搜索结果
- **搜索结果统计**：显示总包数和匹配结果数
- **一键复制**：每个搜索结果都提供安装命令复制功能

---

## 文件结构

```
.
├── docs/
│   ├── index.html              # 首页
│   ├── package.html           # 软件包页面
│   ├── search.html            # 搜索页面
│   ├── assets/
│   │   ├── style.css          # 首页样式
│   │   ├── search.css         # 软件包和搜索页面样式
│   │   ├── app.js             # 首页脚本
│   │   ├── package.js         # 软件包页面脚本
│   │   └── search.js          # 搜索页面脚本
│   ├── packages.json          # 软件包数据源
│   ├── dists/
│   │   └── termux/
│   │       └── main/
│   │           └── binary-aarch64/
│   │               └── Packages  # APT 包索引文件
│   ├── key/
│   │   └── community-repo.asc # GPG 公钥文件
│   ├── logo.jpg              # 社区 logo
│   └── packages/             # .deb 软件包目录
├── scripts/
│   ├── make-web-index.sh     # 生成 packages.json
│   ├── update-repo.sh        # 更新仓库索引
│   ├── make-release.sh       # 发布脚本
│   └── sign-release.sh       # 签名脚本
└── README.md                 # 项目文档
```

---

## 数据格式

### packages.json

软件包数据文件格式：

```json
{
  "updated_at": "2026-09-06T14:51:18+00:00",
  "packages": [
    {
      "name": "gituploader",
      "version": "1.0.0",
      "section": "utils",
      "priority": "optional",
      "architecture": "all",
      "maintainer": "月",
      "description": "Git 上传命令生成器（Linux / Termux 命令行版）",
      "homepage": "https://github.com/1hyql/git-uploader",
      "recommended": true
    }
  ]
}
```

**字段说明**：
- `name`: 软件包名称
- `version`: 软件包版本
- `section`: 软件包分类
- `priority`: 优先级
- `architecture`: 架构（如 all, aarch64）
- `maintainer`: 维护者
- `description`: 描述信息
- `homepage`: 主页链接
- `recommended`: 是否为推荐软件（布尔值）

---

## 维护指南

### 1. 添加新软件包

1. 将 .deb 文件放入 `docs/packages/` 目录
2. 运行 `./scripts/update-repo.sh` 更新索引
3. 运行 `./scripts/make-web-index.sh` 生成网站数据
4. 提交更改并推送

### 2. 更新软件包

1. 替换 `docs/packages/` 目录中的旧 .deb 文件
2. 重复上述构建步骤

### 3. 推荐软件包

在 `make-web-index.sh` 脚本中设置 `RECOMMENDED` 变量：

```bash
# 推荐包（空格分隔）
RECOMMENDED="gituploader another-package"
```

---

## 故障排除

### 1. 源无法访问

- 检查 GitHub Pages 状态
- 验证证书有效性
- 确认文件路径正确

### 2. 软件包安装失败

- 检查 GPG 密钥是否正确导入
- 验证软件包架构是否匹配
- 确认依赖关系是否满足

### 3. 网站显示异常

- 检查 `packages.json` 格式是否正确
- 验证 JavaScript 控制台是否有错误
- 确认 CSS 文件路径正确

---

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

### 提交新软件包

1. Fork 本仓库
2. 将 .deb 文件放入 `docs/packages/` 目录
3. 运行构建脚本更新数据
4. 提交 PR 并说明变更内容

### 报告问题

- 提供详细的错误信息
- 附上截图（如适用）
- 说明复现步骤

---

## 联系方式

- 项目地址：[https://github.com/1hyql/termux-exchangecommunity-repo](https://github.com/1hyql/termux-exchangecommunity-repo)
- 问题反馈：[GitHub Issues](https://github.com/1hyql/termux-exchangecommunity-repo/issues)
- 社区官网：[https://1hyql.github.io/termux](https://1hyql.github.io/termux)

---

**© 2026 Termux Exchange Community Repo**
