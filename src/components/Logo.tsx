import { Box } from '@mui/material';

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <Box
      component="img"
      src={`${import.meta.env.BASE_URL}favicon.svg`}
      alt=""
      width={size}
      height={size}
      sx={{ display: 'block', flexShrink: 0 }}
    />
  );
}
