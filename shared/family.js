// 家系図の構成（人物の位置・続柄）。実名などの個人情報は入れない。
export const COL = 72, ROW = 140, MX = 40, TOP = 44, R = 26, LAB = 84, BW = COL - 2;

const N = (k, rel, long, mark, c, r, self = false) => ({ k, rel, long, mark, c, r, self });

export const TREE = {
  g: {
    label: '新郎家', color: '#4A1C28',
    nodes: [
      N('gGPa', '祖父', '新郎の父方の祖父', '祖父', 0, 0), N('gGPb', '祖母', '新郎の父方の祖母', '祖母', 1, 0),
      N('gGMa', '祖父', '新郎の母方の祖父', '祖父', 3.375, 0), N('gGMb', '祖母', '新郎の母方の祖母', '祖母', 4.375, 0),
      N('gF', '父', '新郎のお父さん', '父', 0.5, 1), N('gM', '母', '新郎のお母さん', '母', 1.5, 1),
      N('gA1', '叔母①', '新郎の母方の叔母①（②の姉）', '叔', 3.75, 1), N('gA2', '叔母②', '新郎の母方の叔母②（①の妹）', '叔', 6.25, 1),
      N('gB', '新郎', '新郎', '新郎', 1, 2, true),
      N('gC1', 'いとこ①（男）', '新郎の母方のいとこ①（②の兄）', '男', 3, 2), N('gC2', 'いとこ②（女）', '新郎の母方のいとこ②（①の妹）', '女', 4.5, 2),
      N('gC3', 'いとこ③（男）', '新郎の母方のいとこ③（④の兄）', '男', 5.5, 2), N('gC4', 'いとこ④（女）', '新郎の母方のいとこ④（③の妹）', '女', 7, 2),
      N('gK1', '子①（男）', 'いとこ①の子①（男）', '男', 2.5, 3), N('gK2', '子②（男）', 'いとこ①の子②（男）', '男', 3.5, 3),
      N('gK3', '子（男）', 'いとこ②の子（男）', '男', 4.5, 3), N('gK4', '子（女）', 'いとこ③の子（女）', '女', 5.5, 3),
      N('gK5', '子①（男）', 'いとこ④の子①（男）', '男', 6.5, 3), N('gK6', '子②（男）', 'いとこ④の子②（男）', '男', 7.5, 3)
    ],
    units: [
      { p: ['gGPa', 'gGPb'], k: ['gF'], couple: true }, { p: ['gGMa', 'gGMb'], k: ['gM', 'gA1', 'gA2'], couple: true },
      { p: ['gF', 'gM'], k: ['gB'], couple: true }, { p: ['gA1'], k: ['gC1', 'gC2'] }, { p: ['gA2'], k: ['gC3', 'gC4'] },
      { p: ['gC1'], k: ['gK1', 'gK2'] }, { p: ['gC2'], k: ['gK3'] }, { p: ['gC3'], k: ['gK4'] }, { p: ['gC4'], k: ['gK5', 'gK6'] }
    ]
  },
  b: {
    label: '新婦家', color: '#7A6455',
    nodes: [
      N('bGMa', '祖父', '新婦の母方の祖父', '祖父', 0, 0), N('bGMb', '祖母', '新婦の母方の祖母', '祖母', 1, 0),
      N('bGPa', '祖父', '新婦の父方の祖父', '祖父', 2.25, 0), N('bGPb', '祖母', '新婦の父方の祖母', '祖母', 3.25, 0),
      N('bM', '母', '新婦のお母さん', '母', 0.5, 1), N('bF', '父', '新婦のお父さん', '父', 1.5, 1), N('bU', '叔父', '新婦の父方の叔父', '叔', 4, 1),
      N('bS', '姉', '新婦の姉', '姉', 0.5, 2), N('bB', '新婦', '新婦', '新婦', 1.5, 2, true),
      N('bC1', 'いとこ（男）', '新婦の父方のいとこ（男）', '男', 3.5, 2), N('bC2', 'いとこ（女）', '新婦の父方のいとこ（女）', '女', 4.5, 2),
      N('bC2h', '旦那さん', 'いとこ（女）の旦那さん', '夫', 5.5, 2),
      N('bK1', '子①（男）', 'いとこ（男）の子①（男）', '男', 3, 3), N('bK2', '子②（男）', 'いとこ（男）の子②（男）', '男', 4, 3),
      N('bK3', '子①（男）', 'いとこ（女）の子①（男）', '男', 5, 3)
    ],
    units: [
      { p: ['bGMa', 'bGMb'], k: ['bM'], couple: true }, { p: ['bGPa', 'bGPb'], k: ['bF', 'bU'], couple: true },
      { p: ['bM', 'bF'], k: ['bS', 'bB'], couple: true }, { p: ['bU'], k: ['bC1', 'bC2'] }, { p: ['bC1'], k: ['bK1', 'bK2'] },
      { p: ['bC2', 'bC2h'], k: ['bK3'], couple: true }
    ]
  }
};

export const NODE_BY = {};
for (const side of ['g', 'b']) for (const n of TREE[side].nodes) NODE_BY[n.k] = { ...n, side };

export const STORY = [
  { id: 's1', when: '20〇〇.〇', title: '出会い', note: '［出会ったきっかけ・第一印象］' },
  { id: 's2', when: '20〇〇.〇', title: 'おつきあい開始', note: '［はじめてのデート・思い出］' },
  { id: 's3', when: '20〇〇.〇', title: 'プロポーズ', note: '［場所・ことば］' },
  { id: 's4', when: 'Today', title: '今日', note: '［これからのこと・ご家族へのひとこと］' }
];

export const QA = ['好きな食べ物は？', '休日は何してる？', '相手のいいところは？', 'これからやりたいことは？'];

// 保存できる場所と項目（サーバーの検証にも使う）
export const SCOPES = ['site', 'people', 'story'];
export const IDS = {
  people: Object.keys(NODE_BY),
  story: STORY.map((s) => s.id),
  site: ['main']
};
export const FIELDS = {
  site: ['groom', 'bride', 'date', 'place', 'message', 'heroPhoto',
    ...QA.flatMap((_, i) => [`qa${i}g`, `qa${i}b`])],
  people: ['name', 'live', 'job', 'likes', 'msg', 'photo'],
  story: ['title', 'note', 'when', 'photo']
};
export const PHOTO_FIELDS = ['photo', 'heroPhoto'];
