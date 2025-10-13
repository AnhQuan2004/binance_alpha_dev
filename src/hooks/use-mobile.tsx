import { useMediaQuery } from 'react-responsive';

export const useMobile = () => {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  return isMobile;
};
