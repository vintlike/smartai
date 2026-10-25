import {
  ApiOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  CloudServerOutlined,
  ClusterOutlined,
  CodeOutlined,
  CommentOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  FlagOutlined,
  FolderOutlined,
  GlobalOutlined,
  HistoryOutlined,
  HomeOutlined,
  KeyOutlined,
  LinkOutlined,
  LockOutlined,
  MessageOutlined,
  MoneyCollectOutlined,
  MonitorOutlined,
  PieChartOutlined,
  ReadOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SendOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  TableOutlined,
  TagsOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';

/** 菜单图标组件类型（antd 图标签名一致，直接沿用） */
export type MenuIconComponent = typeof DashboardOutlined;

/**
 * 菜单图标注册表：key 为 antd 图标组件名去掉 `Outlined` 后缀。
 * 注册后自动支持 `Message` / `MessageOutlined` / `message-outlined` 等写法（归一化后匹配）。
 * 菜单数据里的图标名必须在此注册，未注册则不渲染图标。
 */
const menuIcons: Record<string, MenuIconComponent> = {
  dashboard: DashboardOutlined,
  appstore: AppstoreOutlined,
  robot: RobotOutlined,
  message: MessageOutlined,
  comment: CommentOutlined,
  database: DatabaseOutlined,
  book: BookOutlined,
  read: ReadOutlined,
  filetext: FileTextOutlined,
  folder: FolderOutlined,
  table: TableOutlined,
  barchart: BarChartOutlined,
  piechart: PieChartOutlined,
  moneycollect: MoneyCollectOutlined,
  shoppingcart: ShoppingCartOutlined,
  api: ApiOutlined,
  cloudserver: CloudServerOutlined,
  cluster: ClusterOutlined,
  code: CodeOutlined,
  monitor: MonitorOutlined,
  link: LinkOutlined,
  global: GlobalOutlined,
  bell: BellOutlined,
  calendar: CalendarOutlined,
  tags: TagsOutlined,
  lock: LockOutlined,
  key: KeyOutlined,
  setting: SettingOutlined,
  user: UserOutlined,
  team: TeamOutlined,
  safetycertificate: SafetyCertificateOutlined,
  history: HistoryOutlined,
  home: HomeOutlined,
  thunderbolt: ThunderboltOutlined,
  search: SearchOutlined,
  send: SendOutlined,
  flag: FlagOutlined,
  warning: WarningOutlined,
};

/** 短名别名（比组件名更常用）→ 注册表 key */
const shortIconAliases: Record<string, string> = {
  chat: 'message',
  file: 'filetext',
  chart: 'barchart',
  pie: 'piechart',
  money: 'moneycollect',
  cart: 'shoppingcart',
  server: 'cloudserver',
  thunder: 'thunderbolt',
  safety: 'safetycertificate',
  tag: 'tags',
};

/** 历史 ionicons 风格名称（早期菜单数据）→ 注册表 key */
const legacyIconAliases: Record<string, string> = {
  grid: 'dashboard',
  'paper-plane': 'send',
  cube: 'appstore',
  settings: 'setting',
  alert: 'warning',
  person: 'user',
  people: 'team',
  'document-text': 'filetext',
  'stats-chart': 'barchart',
  'chat-bubble': 'message',
  'lock-closed': 'lock',
};

/** 归一化：忽略大小写、连字符、下划线、空格与命名空间前缀（如 ion:grid-outline） */
function normalizeIconName(name: string): string {
  return name.replace(/[-_\s:]/g, '').toLowerCase();
}

const registry = new Map<string, MenuIconComponent>();

/** 登记图标名及其 Outlined / Outline 变体，兼容不同命名习惯 */
function registerIcon(name: string, Icon: MenuIconComponent) {
  const base = normalizeIconName(name);
  registry.set(base, Icon);
  registry.set(`${base}outline`, Icon);
  registry.set(`${base}outlined`, Icon);
}

for (const [name, Icon] of Object.entries(menuIcons)) {
  registerIcon(name, Icon);
}

for (const aliases of [shortIconAliases, legacyIconAliases]) {
  for (const [alias, target] of Object.entries(aliases)) {
    const Icon = menuIcons[target];
    if (Icon) registerIcon(alias, Icon);
  }
}

/** 根据菜单图标名解析 antd 图标组件，未注册时返回 undefined */
export function resolveMenuIcon(name?: string | null): MenuIconComponent | undefined {
  if (!name) return undefined;
  return registry.get(normalizeIconName(name));
}
