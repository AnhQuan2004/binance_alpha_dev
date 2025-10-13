import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useMobile } from '@/hooks/use-mobile';
import { volumeLadderData } from '@/lib/volume-ladder';
import { Info } from 'lucide-react';

export function VolumeLadder() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMobile();

  const title = 'Bảng khối lượng Volume';

  const content = (
    <div className="p-4">
      <h3 className="text-lg font-semibold">Trading Volume Ladder</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Tham chiếu khối lượng ước tính theo cấp độ Points
      </p>
      <div className="max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Points</th>
              <th className="p-2 text-right">Volume (USD)</th>
            </tr>
          </thead>
          <tbody>
            {volumeLadderData.map(({ point, volume }) => (
              <tr key={point}>
                <td className="p-2 font-mono">{point}</td>
                <td className="p-2 text-right font-mono">
                  ${volume.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Quy tắc: Volume ≈ 2^(point−1) × $2
      </p>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="sm">
            <Info className="mr-2 h-4 w-4" />
            {title}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Info className="mr-2 h-4 w-4" />
          {title}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px]">{content}</PopoverContent>
    </Popover>
  );
}
