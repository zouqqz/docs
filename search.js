/**
 * 三三云文档 · 本地站内搜索
 * ------------------------------------------------------------
 * 背景：自托管部署无法访问 Mintlify 云端搜索 API，顶栏搜索不可用。
 * 方案：本文件被 Mintlify 自动注入每个页面（content 目录 .js 自动包含），
 *       拦截顶栏搜索按钮 / Ctrl+K / '/'，用内置索引做纯本地检索，零外网请求。
 * 索引：文档页 6 个（按章节拆分手写精排，DOC_INDEX）+ OpenAPI 全部接口（脚本生成，API_INDEX）。
 *       文档内容变更时同步更新 DOC_INDEX；接口变更时重新生成 API_INDEX。
 */
(function () {
  if (window.__SS_SEARCH__) return;
  window.__SS_SEARCH__ = true;

  /* ============ 文档页索引（内容变更时手工同步维护） ============ */
  var DOC_INDEX = [
    { t: "平台简介", u: "/platform/info", h: "物联网机遇与挑战", x: "物联网 IoT 全球产业格局 2030年 290亿台 制造业 智慧城市 医疗健康 农业 能源 需求碎片化 现场工程实施复杂 设备运维复杂 设备组网成本高 信息安全挑战 系统智能化程度低" },
    { t: "平台简介", u: "/platform/info", h: "平台化解决方案的必要性", x: "统一物联网平台 软件定义终端 重价值 少工程 免维护 AI赋能平台和终端 可管理超大规模设备连接 海量消息处理和存储 信息安全保障 扩展性 可靠性 成本效益" },
    { t: "平台简介", u: "/platform/info", h: "三三云平台", x: "统一物联网平台 ATU 终端全生命周期 销售 研发 生产 测试 交付 运维 售后 下位机 宏电 E-LINK 生态协议 数据采集 配置 业务数据 存储 展示 转发 功能模块 生产测试 资产管理 用户认证 设备管理 任务管理 数据分析 规则引擎 告警管理 通知管理 数据转发 系统管理 工单管理 计费管理 设备全生命周期管理" },
    { t: "技术架构", u: "/platform/arch", h: "架构图", x: "系统架构图 整体架构" },
    { t: "技术架构", u: "/platform/arch", h: "系统组件", x: "设备服务 设备管理接口 设备升级 参数配置 规则引擎 数据处理 计算 统计 告警服务 告警规则 派生告警 通知服务 发送通知 转发服务 对外部业务平台转发消息 微服务管理 配置 部署 维护 授权 API网关 请求入口 路由 负载均衡 安全防护 限流熔断 接口发布 服务认证 消息服务 MQTT 服务器 A-Link 协议接入设备 消息总线 内部消息流转 消息分片 业务解耦 削峰填谷 数据库 postgresql 主从集群 垂直分库 水平分表 服务分片 缓存 客户端缓存 redis 高速缓存 集群 对象存储 oss 云存储 文件分布式存储 容灾 弹性扩容" },
    { t: "API 使用", u: "/api/info", h: "调用前提", x: "调用 HTTP API 接口 需要先在三三平台上获取 token 令牌 鉴权 认证" },
    { t: "API 使用", u: "/api/info", h: "添加应用", x: "系统 北向API API管理 添加应用 应用名称 过期时间 多个应用 分配不同的API token 调用API接口" },
    { t: "API 使用", u: "/api/info", h: "选择 API", x: "API管理 应用列表 点击应用 勾选右侧的API 为应用添加API 应用的token访问 勾选过的API 其它API 返回无权限" },
    { t: "API 使用", u: "/api/info", h: "查看 TOKEN", x: "应用列表 显示token 查看应用的token" },
    { t: "API 使用", u: "/api/info", h: "调用 API", x: "token 填入 header Authentication 调用API接口 其它参数参考API文档 请求头" },
    { t: "转发配置", u: "/forward/info", h: "内部转发", x: "MQTT 转发 第三方系统连接三三平台的MQTT服务器订阅数据 开启订阅 系统 MQTT订阅 开发者账号 MQTT登录 账号密码 端口 9010 客户端 订阅主题 /sansan/data/forward/{开发者账号}/# 按租户订阅 转发所有租户业务数据 只允许开发者账户使用" },
    { t: "转发配置", u: "/forward/info", h: "外部转发", x: "三三平台推送数据到第三方系统的MQTT服务器 配置服务器 设备 数据转发 转发服务 MQTT服务器IP 端口 用户名 密码 测试服务器是否可用 转发规则 按产品转发 按设备转发 按账号转发 变量名映射 订阅主题 /sansan/data/forward 需要配置第三方 MQTT Broker 只允许租户账户使用" },
    { t: "消息格式", u: "/forward/detail", h: "信息种类", x: "sensor 传感量数据 system 系统量数据 login 设备登录事件 logout 设备登出事件 deviceCreate 设备创建事件 deviceDelete 设备删除事件 deviceUpdate 设备修改事件 funcAck 设备控制响应 消息体 msgType devid from sid data updateTime productCode 业务类型 设备唯一标识" },
    { t: "消息格式", u: "/forward/detail", h: "传感量", x: "sensor 传感量 主题 /sansan/data/forward/testdeveloper/testtenant 消息体示例 data cpu mem" },
    { t: "消息格式", u: "/forward/detail", h: "系统量", x: "system 系统量 主题 消息体 sn" },
    { t: "消息格式", u: "/forward/detail", h: "设备登录事件", x: "login 登录 source platform 设备登录时转发登录事件 主题" },
    { t: "消息格式", u: "/forward/detail", h: "设备登出事件", x: "logout 登出 设备登出时转发登出事件 主题" },
    { t: "消息格式", u: "/forward/detail", h: "设备创建事件", x: "deviceCreate 添加设备触发设备创建事件转发 productCode ATU-SE" },
    { t: "消息格式", u: "/forward/detail", h: "设备删除事件", x: "deviceDelete 删除设备触发设备删除事件转发" },
    { t: "消息格式", u: "/forward/detail", h: "设备修改事件", x: "deviceUpdate 修改设备基本信息触发设备修改事件转发" },
    { t: "消息格式", u: "/forward/detail", h: "设备控制响应", x: "funcAck 下发设备控制命令 设备响应 触发设备响应转发 reboot funcName code 200 重启" },
    { t: "更新记录", u: "/changelog/changelog", h: "版本发布", x: "版本 v1.14.0 Web Shell Web Portal v1.13.0 运营功能优化 修复问题 更新日志" },
    { t: "使用指南（外部文档）", u: "https://alidocs.dingtalk.com/i/p/gBVzxNVxovbMmOao", h: "钉钉在线文档", x: "使用指南 详细使用手册 操作说明" }
  ];

  /* ============ OpenAPI 接口索引（由 api/api.openapi.json 生成） ============ */
  var API_INDEX = [{"t":"添加产品","p":"/api/product/add","m":"POST","h":"产品管理","x":"POST /api/product/add 产品管理 添加产品"},{"t":"产品复制","p":"/api/product/copy","m":"POST","h":"产品管理","x":"POST /api/product/copy 产品管理 产品复制"},{"t":"产品设备同步更新","p":"/api/product/devSync","m":"POST","h":"产品管理","x":"POST /api/product/devSync 产品管理 产品设备同步更新"},{"t":"查询产品列表","p":"/api/product/find","m":"GET","h":"产品管理","x":"GET /api/product/find 产品管理 查询产品列表"},{"t":"查询产品","p":"/api/product/get","m":"GET","h":"产品管理","x":"GET /api/product/get 产品管理 查询产品"},{"t":"编辑产品基本信息","p":"/api/product/modify","m":"POST","h":"产品管理","x":"POST /api/product/modify 产品管理 编辑产品基本信息"},{"t":"删除产品","p":"/api/product/remove","m":"POST","h":"产品管理","x":"POST /api/product/remove 产品管理 删除产品"},{"t":"子任务执行情况","p":"/api/device/subtask/count","m":"GET","h":"任务管理","x":"GET /api/device/subtask/count 任务管理 子任务执行情况 状态status： doing执行中  done已执行 timeout执行超时  failed执行失败"},{"t":"任务详情设备列表","p":"/api/device/subtask/find","m":"GET","h":"任务管理","x":"GET /api/device/subtask/find 任务管理 任务详情设备列表 升级状态status： doing 执行中 done 执行完成 timeout超时  failed执行失败"},{"t":"失败任务重试","p":"/api/device/subtask/retry","m":"POST","h":"任务管理","x":"POST /api/device/subtask/retry 任务管理 失败任务重试"},{"t":"任务类型的执行情况","p":"/api/device/subtask/type/count","m":"GET","h":"任务管理","x":"GET /api/device/subtask/type/count 任务管理 任务类型的执行情况"},{"t":"新增任务","p":"/api/device/task/add","m":"POST","h":"任务管理","x":"POST /api/device/task/add 任务管理 新增任务"},{"t":"取消未执行任务","p":"/api/device/task/cancel","m":"POST","h":"任务管理","x":"POST /api/device/task/cancel 任务管理 取消未执行任务"},{"t":"删除任务","p":"/api/device/task/del","m":"POST","h":"任务管理","x":"POST /api/device/task/del 任务管理 删除任务"},{"t":"修改任务","p":"/api/device/task/edit","m":"POST","h":"任务管理","x":"POST /api/device/task/edit 任务管理 修改任务"},{"t":"执行任务","p":"/api/device/task/exec","m":"POST","h":"任务管理","x":"POST /api/device/task/exec 任务管理 执行任务"},{"t":"设备任务列表","p":"/api/device/task/find","m":"GET","h":"任务管理","x":"GET /api/device/task/find 任务管理 设备任务列表 任务状态 0任务新建状态  1执行中状态  2执行完成状态；执行中状态不允许重复执行，不允许删除任务"},{"t":"设置数据excel导入","p":"/api/device/task/import","m":"POST","h":"任务管理","x":"POST /api/device/task/import 任务管理 设置数据excel导入"},{"t":"设置数据模板下载","p":"/api/device/task/template","m":"GET","h":"任务管理","x":"GET /api/device/task/template 任务管理 设置数据模板下载"},{"t":"告警导出","p":"/api/alarm/export","m":"GET","h":"告警中心","x":"GET /api/alarm/export 告警中心 告警导出"},{"t":"查询告警列表","p":"/api/alarm/find","m":"GET","h":"告警中心","x":"GET /api/alarm/find 告警中心 查询告警列表"},{"t":"查询设备最新告警","p":"/api/alarm/latest","m":"GET","h":"告警中心","x":"GET /api/alarm/latest 告警中心 查询设备最新告警"},{"t":"告警处理","p":"/api/alarm/process","m":"POST","h":"告警中心","x":"POST /api/alarm/process 告警中心 告警处理"},{"t":"删除告警记录","p":"/api/alarm/remove","m":"POST","h":"告警中心","x":"POST /api/alarm/remove 告警中心 删除告警记录"},{"t":"添加告警规则","p":"/api/alarm/rule/add","m":"POST","h":"告警中心","x":"POST /api/alarm/rule/add 告警中心 添加告警规则"},{"t":"告警规则列表","p":"/api/alarm/rule/find","m":"GET","h":"告警中心","x":"GET /api/alarm/rule/find 告警中心 告警规则列表"},{"t":"告警规则编辑","p":"/api/alarm/rule/modify","m":"POST","h":"告警中心","x":"POST /api/alarm/rule/modify 告警中心 告警规则编辑"},{"t":"删除告警规则","p":"/api/alarm/rule/remove","m":"POST","h":"告警中心","x":"POST /api/alarm/rule/remove 告警中心 删除告警规则"},{"t":"告警排名","p":"/api/alarm/top","m":"GET","h":"告警中心","x":"GET /api/alarm/top 告警中心 告警排名"},{"t":"告警趋势","p":"/api/alarm/trend","m":"GET","h":"告警中心","x":"GET /api/alarm/trend 告警中心 告警趋势"},{"t":"新增参数模板","p":"/api/device/conf-template/add","m":"POST","h":"固件和参数","x":"POST /api/device/conf-template/add 固件和参数 新增参数模板"},{"t":"编辑参数模板","p":"/api/device/conf-template/edit","m":"POST","h":"固件和参数","x":"POST /api/device/conf-template/edit 固件和参数 编辑参数模板"},{"t":"查询参数模板","p":"/api/device/conf-template/find","m":"GET","h":"固件和参数","x":"GET /api/device/conf-template/find 固件和参数 查询参数模板"},{"t":"删除参数模板","p":"/api/device/conf-template/remove","m":"POST","h":"固件和参数","x":"POST /api/device/conf-template/remove 固件和参数 删除参数模板"},{"t":"设备转存参数模板","p":"/api/device/config/saveAsTemplate","m":"POST","h":"固件和参数","x":"POST /api/device/config/saveAsTemplate 固件和参数 设备转存参数模板"},{"t":"添加安装包","p":"/api/device/package/add","m":"POST","h":"固件和参数","x":"POST /api/device/package/add 固件和参数 添加安装包"},{"t":"删除安装包","p":"/api/device/package/del","m":"POST","h":"固件和参数","x":"POST /api/device/package/del 固件和参数 删除安装包"},{"t":"编辑安装包","p":"/api/device/package/edit","m":"POST","h":"固件和参数","x":"POST /api/device/package/edit 固件和参数 编辑安装包"},{"t":"安装包列表","p":"/api/device/package/find","m":"GET","h":"固件和参数","x":"GET /api/device/package/find 固件和参数 安装包列表"},{"t":"安装包下载","p":"/api/device/package/info","m":"POST","h":"固件和参数","x":"POST /api/device/package/info 固件和参数 安装包下载"},{"t":"设备文件信息(状态)","p":"/api/device/file/get","m":"POST","h":"日志文件","x":"POST /api/device/file/get 日志文件 设备文件信息(状态)"},{"t":"设备文件打开","p":"/api/device/file/open","m":"POST","h":"日志文件","x":"POST /api/device/file/open 日志文件 设备文件打开"},{"t":"设备文件读取","p":"/api/device/file/read","m":"POST","h":"日志文件","x":"POST /api/device/file/read 日志文件 设备文件读取"},{"t":"查询设备日志","p":"/api/device/log","m":"GET","h":"日志文件","x":"GET /api/device/log 日志文件 查询设备日志"},{"t":"设备模型同步","p":"/api/device/model/get","m":"POST","h":"硬件模型","x":"POST /api/device/model/get 硬件模型 设备模型同步"},{"t":"设备模型保存","p":"/api/device/model/save","m":"POST","h":"硬件模型","x":"POST /api/device/model/save 硬件模型 设备模型保存"},{"t":"登录","p":"/api/auth/login","m":"POST","h":"系统管理","x":"POST /api/auth/login 系统管理 登录"},{"t":"创建分组","p":"/api/dept/add","m":"POST","h":"系统管理","x":"POST /api/dept/add 系统管理 创建分组"},{"t":"查询分组树","p":"/api/dept/find","m":"GET","h":"系统管理","x":"GET /api/dept/find 系统管理 查询分组树"},{"t":"查询单个分组","p":"/api/dept/get","m":"GET","h":"系统管理","x":"GET /api/dept/get 系统管理 查询单个分组"},{"t":"查询分组列表","p":"/api/dept/list","m":"GET","h":"系统管理","x":"GET /api/dept/list 系统管理 查询分组列表"},{"t":"修改分组","p":"/api/dept/modify","m":"POST","h":"系统管理","x":"POST /api/dept/modify 系统管理 修改分组"},{"t":"删除分组","p":"/api/dept/remove","m":"POST","h":"系统管理","x":"POST /api/dept/remove 系统管理 删除分组"},{"t":"下载文件","p":"/api/file/download/{filePath}","m":"GET","h":"系统管理","x":"GET /api/file/download/{filePath} 系统管理 下载文件 /api/file/download/{filePath}  ， filePath形如 租户id/用户id/文件名，若图片请求缩略图，则加入_thumbnail"},{"t":"删除文件","p":"/api/file/remove","m":"POST","h":"系统管理","x":"POST /api/file/remove 系统管理 删除文件"},{"t":"上传文件","p":"/api/file/upload","m":"POST","h":"系统管理","x":"POST /api/file/upload 系统管理 上传文件"},{"t":"查询用户信息","p":"/api/user/get","m":"GET","h":"系统管理","x":"GET /api/user/get 系统管理 查询用户信息"},{"t":"登出","p":"/api/user/logout","m":"POST","h":"系统管理","x":"POST /api/user/logout 系统管理 登出"},{"t":"添加设备","p":"/api/device/add","m":"POST","h":"设备信息","x":"POST /api/device/add 设备信息 添加设备"},{"t":"设备批量分组","p":"/api/device/changeGroup","m":"POST","h":"设备信息","x":"POST /api/device/changeGroup 设备信息 设备批量分组"},{"t":"查询设备事件","p":"/api/device/event","m":"GET","h":"设备信息","x":"GET /api/device/event 设备信息 查询设备事件"},{"t":"设备导出","p":"/api/device/export","m":"GET","h":"设备信息","x":"GET /api/device/export 设备信息 设备导出"},{"t":"设备收藏","p":"/api/device/favorite","m":"POST","h":"设备信息","x":"POST /api/device/favorite 设备信息 设备收藏"},{"t":"查询设备列表","p":"/api/device/find","m":"GET","h":"设备信息","x":"GET /api/device/find 设备信息 查询设备列表"},{"t":"按设备配置过滤设备列表","p":"/api/device/find-by-config","m":"GET","h":"设备信息","x":"GET /api/device/find-by-config 设备信息 按设备配置过滤设备列表"},{"t":"查询设备","p":"/api/device/get","m":"GET","h":"设备信息","x":"GET /api/device/get 设备信息 查询设备"},{"t":"设备导入","p":"/api/device/import","m":"POST","h":"设备信息","x":"POST /api/device/import 设备信息 设备导入"},{"t":"设备导入模板","p":"/api/device/import/template","m":"GET","h":"设备信息","x":"GET /api/device/import/template 设备信息 设备导入模板"},{"t":"设备初始化","p":"/api/device/initialize","m":"POST","h":"设备信息","x":"POST /api/device/initialize 设备信息 设备初始化"},{"t":"编辑设备信息","p":"/api/device/modify","m":"POST","h":"设备信息","x":"POST /api/device/modify 设备信息 编辑设备信息"},{"t":"设备Ping","p":"/api/device/ping/status","m":"POST","h":"设备信息","x":"POST /api/device/ping/status 设备信息 设备Ping"},{"t":"删除设备","p":"/api/device/remove","m":"POST","h":"设备信息","x":"POST /api/device/remove 设备信息 删除设备"},{"t":"设备保存为产品","p":"/api/device/save/product","m":"POST","h":"设备信息","x":"POST /api/device/save/product 设备信息 设备保存为产品"},{"t":"查设备在线状态","p":"/api/device/status","m":"POST","h":"设备信息","x":"POST /api/device/status 设备信息 查设备在线状态"},{"t":"新增标签","p":"/api/device/tag/add","m":"POST","h":"设备信息","x":"POST /api/device/tag/add 设备信息 新增标签"},{"t":"编辑标签","p":"/api/device/tag/edit","m":"POST","h":"设备信息","x":"POST /api/device/tag/edit 设备信息 编辑标签"},{"t":"查询标签列表","p":"/api/device/tag/find","m":"GET","h":"设备信息","x":"GET /api/device/tag/find 设备信息 查询标签列表"},{"t":"查询标签详情","p":"/api/device/tag/get","m":"GET","h":"设备信息","x":"GET /api/device/tag/get 设备信息 查询标签详情"},{"t":"添加标签关联关系","p":"/api/device/tag/relation/add","m":"POST","h":"设备信息","x":"POST /api/device/tag/relation/add 设备信息 添加标签关联关系"},{"t":"删除标签关联关系","p":"/api/device/tag/relation/remove","m":"POST","h":"设备信息","x":"POST /api/device/tag/relation/remove 设备信息 删除标签关联关系"},{"t":"删除标签","p":"/api/device/tag/remove","m":"POST","h":"设备信息","x":"POST /api/device/tag/remove 设备信息 删除标签"},{"t":"查询profile","p":"/api/profile/get","m":"GET","h":"设备信息","x":"GET /api/profile/get 设备信息 查询profile"},{"t":"查询schema","p":"/api/schema/get","m":"GET","h":"设备信息","x":"GET /api/schema/get 设备信息 查询schema"},{"t":"设备功能控制","p":"/api/device/func/set","m":"POST","h":"设备功能","x":"POST /api/device/func/set 设备功能 设备功能控制"},{"t":"编辑控制模型","p":"/api/profile/func/modify","m":"POST","h":"设备功能","x":"POST /api/profile/func/modify 设备功能 编辑控制模型"},{"t":"查询(多)设备历史属性","p":"/api/device/historysystem/find","m":"GET","h":"设备属性","x":"GET /api/device/historysystem/find 设备属性 查询(多)设备历史属性"},{"t":"查询设备历史属性","p":"/api/device/historysystem/get","m":"GET","h":"设备属性","x":"GET /api/device/historysystem/get 设备属性 查询设备历史属性"},{"t":"设备属性查询","p":"/api/device/props/get","m":"POST","h":"设备属性","x":"POST /api/device/props/get 设备属性 设备属性查询"},{"t":"设备系统量保存","p":"/api/device/system/save","m":"POST","h":"设备属性","x":"POST /api/device/system/save 设备属性 设备系统量保存"},{"t":"产品设备系统量保存","p":"/api/product/system/save","m":"POST","h":"设备属性","x":"POST /api/product/system/save 设备属性 产品设备系统量保存"},{"t":"查询sensor历史报文","p":"/api/device/data/history/find","m":"GET","h":"设备数据","x":"GET /api/device/data/history/find 设备数据 查询sensor历史报文"},{"t":"查询(多)设备历史数据","p":"/api/device/historydata/find","m":"GET","h":"设备数据","x":"GET /api/device/historydata/find 设备数据 查询(多)设备历史数据"},{"t":"查询设备历史数据","p":"/api/device/historydata/get","m":"GET","h":"设备数据","x":"GET /api/device/historydata/get 设备数据 查询设备历史数据"},{"t":"设备数据下发","p":"/api/device/sensor/set","m":"POST","h":"设备数据","x":"POST /api/device/sensor/set 设备数据 设备数据下发"},{"t":"添加传感量","p":"/api/var/sensor/add","m":"POST","h":"设备数据","x":"POST /api/var/sensor/add 设备数据 添加传感量"},{"t":"传感量配置清空","p":"/api/var/sensor/clear-conf","m":"POST","h":"设备数据","x":"POST /api/var/sensor/clear-conf 设备数据 传感量配置清空"},{"t":"导出传感量","p":"/api/var/sensor/export","m":"GET","h":"设备数据","x":"GET /api/var/sensor/export 设备数据 导出传感量"},{"t":"查询传感量","p":"/api/var/sensor/find","m":"GET","h":"设备数据","x":"GET /api/var/sensor/find 设备数据 查询传感量"},{"t":"导入传感量","p":"/api/var/sensor/import","m":"POST","h":"设备数据","x":"POST /api/var/sensor/import 设备数据 导入传感量"},{"t":"编辑传感量","p":"/api/var/sensor/modify","m":"POST","h":"设备数据","x":"POST /api/var/sensor/modify 设备数据 编辑传感量"},{"t":"删除传感量","p":"/api/var/sensor/remove","m":"POST","h":"设备数据","x":"POST /api/var/sensor/remove 设备数据 删除传感量"},{"t":"设备配置查询","p":"/api/device/config/get","m":"POST","h":"设备配置","x":"POST /api/device/config/get 设备配置 设备配置查询"},{"t":"多设备配置下发任务","p":"/api/device/config/multi-set","m":"POST","h":"设备配置","x":"POST /api/device/config/multi-set 设备配置 多设备配置下发任务"},{"t":"设备配置保存","p":"/api/device/config/save","m":"POST","h":"设备配置","x":"POST /api/device/config/save 设备配置 设备配置保存"},{"t":"设备批量配置合并保存","p":"/api/device/config/saveBatch","m":"POST","h":"设备配置","x":"POST /api/device/config/saveBatch 设备配置 设备批量配置合并保存"},{"t":"设备配置下发","p":"/api/device/config/set","m":"POST","h":"设备配置","x":"POST /api/device/config/set 设备配置 设备配置下发"},{"t":"产品设备配置保存","p":"/api/product/config/save","m":"POST","h":"设备配置","x":"POST /api/product/config/save 设备配置 产品设备配置保存"},{"t":"新增模板","p":"/api/notification/new/template/add","m":"POST","h":"通知中心","x":"POST /api/notification/new/template/add 通知中心 新增模板"},{"t":"停用通知模板","p":"/api/notification/new/template/disable","m":"POST","h":"通知中心","x":"POST /api/notification/new/template/disable 通知中心 停用通知模板"},{"t":"启用通知模板","p":"/api/notification/new/template/enable","m":"POST","h":"通知中心","x":"POST /api/notification/new/template/enable 通知中心 启用通知模板"},{"t":"模板列表","p":"/api/notification/new/template/find","m":"GET","h":"通知中心","x":"GET /api/notification/new/template/find 通知中心 模板列表"},{"t":"编辑模板","p":"/api/notification/new/template/modify","m":"POST","h":"通知中心","x":"POST /api/notification/new/template/modify 通知中心 编辑模板"},{"t":"删除模板","p":"/api/notification/new/template/remove","m":"POST","h":"通知中心","x":"POST /api/notification/new/template/remove 通知中心 删除模板"},{"t":"查询通知记录列表","p":"/api/notification/record/find","m":"GET","h":"通知中心","x":"GET /api/notification/record/find 通知中心 查询通知记录列表"},{"t":"通知已读更新","p":"/api/notification/record/read","m":"POST","h":"通知中心","x":"POST /api/notification/record/read 通知中心 通知已读更新"},{"t":"查询通知未读计数","p":"/api/notification/record/subcount","m":"GET","h":"通知中心","x":"GET /api/notification/record/subcount 通知中心 查询通知未读计数"}];

  var INDEX = DOC_INDEX.concat(API_INDEX);

  /* ============ API 页面 URL 前缀学习 ============
     Mintlify 生成的接口页 URL 前缀与版本/锚点 slug 有关，不硬编码：
     1) 跳转前优先从侧边栏链接反查真实 href（最准）；
     2) 用户访问过任意接口页后，从 location.pathname 学到前缀存 localStorage；
     3) 兜底 /api-reference。 */
  function apiPrefix() {
    if (window.__ssApiPrefix) return window.__ssApiPrefix;
    try { var s = localStorage.getItem("ssApiPrefix"); if (s) { window.__ssApiPrefix = s; return s; } } catch (e) {}
    return "/api-reference";
  }
  function learnPrefix() {
    var path = window.location.pathname;
    for (var i = 0; i < API_INDEX.length; i++) {
      var p = API_INDEX[i].p;
      if (p && path.indexOf(p) !== -1) {
        var prefix = path.slice(0, path.indexOf(p));
        window.__ssApiPrefix = prefix;
        try { localStorage.setItem("ssApiPrefix", prefix); } catch (e) {}
        return;
      }
    }
  }
  learnPrefix();

  function resolveUrl(e) {
    if (e.u) return e.u.indexOf("http") === 0 ? e.u : window.location.origin + e.u;
    try {
      var a = document.querySelector('#sidebar a[href*="' + e.p + '"]');
      if (a && a.href) return a.href;
    } catch (err) {}
    /* 兜底 1：按侧边栏链接可见文本匹配接口标题。
       Mintlify 生成的接口页 slug 不包含原始 API 路径，
       用标题文本反查与 slug 规则解耦，最稳。优先全等，再退包含。 */
    try {
      var links = document.querySelectorAll("#sidebar a");
      var i, txt;
      for (i = 0; i < links.length; i++) {
        txt = (links[i].textContent || "").trim();
        if (txt === e.t && links[i].href) return links[i].href;
      }
      for (i = 0; i < links.length; i++) {
        txt = (links[i].textContent || "").trim();
        if (txt.indexOf(e.t) !== -1 && links[i].href) return links[i].href;
      }
    } catch (err) {}
    /* 兜底 2：去掉路径首段后再匹配 href（如 /api/device/x → /device/x） */
    try {
      var suffix = e.p.replace(/^\/[^/]+/, "");
      var a2 = document.querySelector('#sidebar a[href*="' + suffix + '"]');
      if (a2 && a2.href) return a2.href;
    } catch (err) {}
    return window.location.origin + apiPrefix() + e.p;
  }

  /* ============ 样式注入 ============ */
  var style = document.createElement("style");
  style.textContent = [
    "#ss-search-overlay{position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.45);display:flex;justify-content:center;align-items:flex-start;padding:14vh 16px 0;font-family:inherit}",
    "#ss-search-panel{width:min(580px,94vw);background:#fff;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,.25);overflow:hidden}",
    "#ss-search-input{width:100%;box-sizing:border-box;padding:14px 18px;border:none;outline:none;font-size:15px;border-bottom:1px solid #e5e7eb;color:#111827}",
    "#ss-search-input::placeholder{color:#9ca3af}",
    "#ss-search-results{max-height:420px;overflow-y:auto;padding:8px}",
    "#ss-search-results .ss-empty{padding:28px 16px;text-align:center;color:#9ca3af;font-size:14px}",
    ".ss-item{padding:10px 12px;border-radius:8px;cursor:pointer}",
    ".ss-item.active,.ss-item:hover{background:#f3f4f6}",
    ".ss-item .ss-t{font-weight:600;color:#111827;font-size:14px}",
    ".ss-item .ss-h{color:#3b82f6;font-size:12px;margin-left:8px;font-weight:500}",
    ".ss-item .ss-x{color:#6b7280;font-size:12.5px;margin-top:3px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
    ".ss-item mark{background:#fde68a;color:inherit;padding:0 1px;border-radius:2px}",
    ".ss-method{display:inline-block;font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;color:#fff;margin-right:6px;vertical-align:1px}",
    "#ss-search-footer{padding:8px 14px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:11.5px;display:flex;gap:14px}"
  ].join("");
  document.head.appendChild(style);

  var METHOD_COLOR = { GET: "#059669", POST: "#2563eb", PUT: "#d97706", DELETE: "#dc2626", PATCH: "#7c3aed" };

  /* ============ 搜索逻辑 ============ */
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function matchEntry(e, terms) {
    var score = 0, all = (e.t + " " + e.h + " " + e.x).toLowerCase();
    for (var i = 0; i < terms.length; i++) {
      var q = terms[i];
      if (all.indexOf(q) === -1) return 0;
      if (e.t.toLowerCase().indexOf(q) !== -1) score += 100;
      if (e.h.toLowerCase().indexOf(q) !== -1) score += 40;
      var idx = 0, n = 0;
      while ((idx = e.x.toLowerCase().indexOf(q, idx)) !== -1 && n < 3) { score += 10; idx += q.length; n++; }
    }
    return score;
  }

  function doSearch(q) {
    var terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return INDEX
      .map(function (e) { return { e: e, s: matchEntry(e, terms) }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 12)
      .map(function (r) { return r.e; });
  }

  function snippet(e, terms) {
    var x = e.x, low = x.toLowerCase(), pos = -1;
    for (var i = 0; i < terms.length; i++) { pos = low.indexOf(terms[i]); if (pos !== -1) break; }
    if (pos === -1) return esc(x.slice(0, 80));
    var start = Math.max(0, pos - 30), end = Math.min(x.length, pos + 60);
    var frag = (start > 0 ? "…" : "") + x.slice(start, end) + (end < x.length ? "…" : "");
    frag = esc(frag);
    terms.forEach(function (t) {
      frag = frag.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), function (m) { return "<mark>" + m + "</mark>"; });
    });
    return frag;
  }

  /* ============ 弹窗 UI ============ */
  var overlay = null, input = null, listBox = null, results = [], active = 0;

  function render(q) {
    results = doSearch(q);
    active = 0;
    if (!q.trim()) {
      listBox.innerHTML = '<div class="ss-empty">输入关键词搜索文档 / 接口</div>';
      return;
    }
    if (!results.length) {
      listBox.innerHTML = '<div class="ss-empty">未找到与「' + esc(q) + '」相关的内容</div>';
      return;
    }
    var terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    listBox.innerHTML = results.map(function (e, i) {
      var badge = e.m ? '<span class="ss-method" style="background:' + (METHOD_COLOR[e.m] || "#6b7280") + '">' + e.m + "</span>" : "";
      return '<div class="ss-item' + (i === active ? " active" : "") + '" data-i="' + i + '">' +
        badge +
        '<span class="ss-t">' + esc(e.t) + "</span>" +
        '<span class="ss-h">' + esc(e.h) + "</span>" +
        '<div class="ss-x">' + snippet(e, terms) + "</div></div>";
    }).join("");
  }

  function go(i) {
    var e = results[i];
    if (!e) return;
    var url = resolveUrl(e);
    closeModal();
    window.location.href = url;
  }

  function openModal() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.id = "ss-search-overlay";
    overlay.innerHTML =
      '<div id="ss-search-panel">' +
      '<input id="ss-search-input" type="text" placeholder="搜索文档 / 接口…（如：配置下发、token、MQTT、device/find）" />' +
      '<div id="ss-search-results"></div>' +
      '<div id="ss-search-footer"><span>↑↓ 选择</span><span>Enter 跳转</span><span>Esc 关闭</span></div>' +
      "</div>";
    document.body.appendChild(overlay);
    input = overlay.querySelector("#ss-search-input");
    listBox = overlay.querySelector("#ss-search-results");
    input.focus();
    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowDown") { ev.preventDefault(); active = Math.min(active + 1, results.length - 1); paint(); }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); active = Math.max(active - 1, 0); paint(); }
      else if (ev.key === "Enter") { go(active); }
      else if (ev.key === "Escape") { closeModal(); }
    });
    listBox.addEventListener("click", function (ev) {
      var item = ev.target.closest(".ss-item");
      if (item) go(parseInt(item.getAttribute("data-i"), 10));
    });
    overlay.addEventListener("mousedown", function (ev) { if (ev.target === overlay) closeModal(); });
    render("");
  }

  function paint() {
    listBox.querySelectorAll(".ss-item").forEach(function (el, i) {
      el.classList.toggle("active", i === active);
    });
  }

  function closeModal() {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null; input = null; listBox = null; results = [];
  }

  /* ============ 接管原生搜索入口（捕获阶段，抢在 Mintlify 云搜索之前） ============ */
  var TRIGGER_SEL = '#search-bar, .search-bar, [data-component-part*="search"], button[aria-label*="Search" i], button[aria-label*="搜索"], [class*="search-trigger" i]';

  document.addEventListener("click", function (ev) {
    var t = ev.target.closest ? ev.target.closest(TRIGGER_SEL) : null;
    if (t) { ev.preventDefault(); ev.stopPropagation(); openModal(); }
  }, true);

  document.addEventListener("keydown", function (ev) {
    var tag = (ev.target.tagName || "").toLowerCase();
    var typing = tag === "input" || tag === "textarea" || ev.target.isContentEditable;
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") {
      ev.preventDefault(); openModal();
    } else if (!typing && ev.key === "/") {
      ev.preventDefault(); openModal();
    }
  });
})();
