import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import GitHub from '@mui/icons-material/GitHub';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import { effects } from '../effects';
import { CATEGORY_LABELS } from '../core/types';
import Section from '../components/Section';
import Logo from '../components/Logo';

export const REPOSITORY_URL = 'https://github.com/MasakiNiwa/TaMaNi-Effect';

const STEPS = [
  ['画像を読み込む', '「画像を選ぶ」ボタン、ドラッグ＆ドロップ、貼り付け（Ctrl+V / ⌘V）のどれでも読み込めます。'],
  ['エフェクトを追加', '「追加」ボタンから好きなエフェクトを選びます。いくつでも重ねられます。'],
  ['調整する', 'エフェクト名をタップすると設定が開きます。スライダーを動かすとすぐにプレビューに反映されます。'],
  ['保存する', '「保存」ボタンで原寸の画像を書き出します。スマホでは「共有」から写真アプリなどに送れます。'],
];

const FAQ = [
  ['画像はどこかに送信されますか？', 'いいえ。すべての処理はお使いのブラウザの中だけで行われ、画像がサーバーに送信されることはありません。'],
  [
    'エフェクトの順番に意味はありますか？',
    'はい。下にあるエフェクトから順番にかかり、上にあるエフェクトほど後からかかります。矢印ボタンで順番を入れ替えると仕上がりが変わります。',
  ],
  ['「強さ」と「重ね方」とは？', '「強さ」はエフェクトをどのくらい濃くかけるか、「重ね方」はエフェクト結果を下の画像にどう合成するか（乗算・スクリーンなど）を決めます。'],
  ['「ランダムを変える」とは？', '不揃いさやグリッチなどランダムな要素の出方を変えます。同じ設定なら何度書き出しても同じ結果になります。'],
  ['元の画像と見比べたい', '画面下のツールバーの比較ボタン（◧）を押している間、元の画像が表示されます。'],
  ['動作が重いときは？', '設定の「プレビューの画質」を下げると軽くなります。保存時は常に原寸（または設定したサイズ）で書き出されます。'],
];

export default function HelpPage() {
  const categories = [...new Set(effects.map((e) => e.category))];
  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Section title="使い方">
          <Stack spacing={2}>
            {STEPS.map(([title, body], i) => (
              <Stack key={title} direction="row" spacing={1.5}>
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {i + 1}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {body}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Section>

        <Section title="エフェクト一覧">
          <Stack spacing={2} divider={<Divider />}>
            {categories.map((cat) => (
              <Box key={cat}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {CATEGORY_LABELS[cat]}
                </Typography>
                <Stack spacing={1} sx={{ mt: 0.5 }}>
                  {effects
                    .filter((e) => e.category === cat)
                    .map((e) => (
                      <Box key={e.id}>
                        <Typography sx={{ fontWeight: 700 }}>{e.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {e.description}
                        </Typography>
                      </Box>
                    ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Section>

        <section>
          <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, px: 1, mb: 1 }}>
            よくある質問
          </Typography>
          {FAQ.map(([q, a]) => (
            <Accordion key={q} disableGutters elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                <Typography sx={{ fontWeight: 500 }}>{q}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Typography variant="body2" color="text.secondary">
                  {a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </section>

        <Section title="このアプリについて">
          <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 1 }}>
            <Logo size={56} />
            <Box>
              <Typography variant="h1" sx={{ fontSize: 22 }}>
                たまにエフェクト
              </Typography>
              <Typography variant="body2" color="text.secondary">
                たまに使うエフェクトツール
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700 }}>バージョン {__APP_VERSION__}</Typography>
              <Typography variant="caption" color="text.secondary">
                ビルド {__BUILD_DATE__}（{__BUILD_COMMIT__}）
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<GitHub />}
              endIcon={<OpenInNewRounded fontSize="small" />}
              href={REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub リポジトリ
            </Button>
            <Typography variant="caption" color="text.secondary">
              MIT License
            </Typography>
          </Stack>
        </Section>
      </Stack>
    </Container>
  );
}
