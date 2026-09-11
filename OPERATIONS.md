# Termux Exchange Community Repo 运维手册

本文档面向仓库维护者，不是给 Termux 用户的安装说明。

## 1. 环境要求

构建脚本需要在 Linux/Unix 或 WSL 中运行：

- bash
- dpkg-deb
- gzip
- gpg
- coreutils（包含 `stat`、`sha256sum`、`date`、`find`）

当前仓库只生成 `aarch64` 仓库索引；`all` 架构的软件包也会进入该索引。

## 2. 添加软件包

1. 将 `.deb` 文件放入 `docs/packages/`。
2. 检查包名、版本、架构和依赖信息：

   ```bash
   dpkg-deb -I docs/packages/example.deb
   ```

3. 更新 APT 包索引：

   ```bash
   bash scripts/update-repo.sh
   ```

4. 生成网站使用的软件包数据：

   ```bash
   bash scripts/make-web-index.sh
   ```

5. 检查 `docs/packages.json` 内容后，生成 Release 元数据：

   ```bash
   bash scripts/make-release.sh
   ```

6. 使用发布密钥签名：

   ```bash
   bash scripts/sign-release.sh
   ```

7. 检查变更并提交：

   ```bash
   git status
   git diff --check
   git add docs README.md OPERATIONS.md
   git commit -m "Add package example"
   git push
   ```

不要跳过 `make-release.sh` 直接签名。签名的是最新的 `docs/dists/termux/Release` 文件。

## 3. 更新或删除软件包

更新软件包时，将新版本 `.deb` 放入 `docs/packages/`，然后重复完整的添加流程。是否删除旧版本取决于是否需要支持回滚或旧客户端；删除后同样必须重新生成索引、Release 和签名。

删除软件包：

```bash
rm docs/packages/example_old.deb
bash scripts/update-repo.sh
bash scripts/make-web-index.sh
bash scripts/make-release.sh
bash scripts/sign-release.sh
```

## 4. 推荐软件包

推荐列表目前由 `scripts/make-web-index.sh` 中的 `RECOMMENDED` 变量控制：

```bash
RECOMMENDED="gituploader another-package"
```

修改后重新运行：

```bash
bash scripts/make-web-index.sh
bash scripts/make-release.sh
bash scripts/sign-release.sh
```

## 5. 发布前检查

确认以下文件均已更新并处于同一次变更中：

- `docs/packages/` 中的软件包
- `docs/dists/termux/main/binary-aarch64/Packages`
- `docs/dists/termux/main/binary-aarch64/Packages.gz`
- `docs/packages.json`
- `docs/dists/termux/Release`
- `docs/dists/termux/Release.gpg`
- `docs/dists/termux/InRelease`

检查 Release 哈希：

```bash
grep -A 20 '^SHA256:' docs/dists/termux/Release
```

检查签名：

```bash
gpg --verify docs/dists/termux/Release.gpg docs/dists/termux/Release
gpg --verify docs/dists/termux/InRelease
```

## 6. 故障排查

### 源无法访问

- 检查 GitHub Pages 构建和部署状态。
- 检查 `dists/termux/Release`、`InRelease` 和 `Release.gpg` 是否已发布。
- 检查仓库 URL、组件名 `main` 和架构 `aarch64` 是否一致。

### 软件包安装失败

- 检查客户端是否导入了正确的 GPG 公钥。
- 检查 `Packages` 中的软件包架构、依赖和文件名。
- 检查 `Filename` 指向的 `.deb` 是否实际存在。
- 检查软件包依赖是否也已发布到仓库或由 Termux 官方源提供。

### 网页数据异常

- 检查 `docs/packages.json` 是否为合法 JSON。
- 确认 `make-web-index.sh` 在索引更新后执行。
- 检查浏览器控制台和 GitHub Pages 部署日志。

## 7. 用户侧文档

用户安装和使用说明请查看 [README.md](README.md)。
