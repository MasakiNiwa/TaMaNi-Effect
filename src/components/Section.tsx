import type { ReactNode } from 'react';
import { Card, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { surface } from '../theme';

export default function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <section>
      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, px: 1, mb: 1 }}>
        {title}
      </Typography>
      <Card sx={{ bgcolor: surface(theme.palette.mode, 1), p: { xs: 2, sm: 2.5 } }}>{children}</Card>
    </section>
  );
}
