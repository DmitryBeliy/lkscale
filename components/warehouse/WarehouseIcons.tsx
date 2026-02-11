import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '@/constants/theme';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Stock In Icon - Box with arrow pointing down into it
export const StockInIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.success,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 12V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 4V14M12 14L8 10M12 14L16 10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Write Off Icon - Box with X mark
export const WriteOffIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.error,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6H4L5.5 19C5.5 20.1046 6.39543 21 7.5 21H16.5C17.6046 21 18.5 20.1046 18.5 19L20 6Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 3H15V6H9V3Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 11L14 15M14 11L10 15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Transfer Icon - Two boxes with bidirectional arrows
export const TransferIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.primary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="5"
      width="6"
      height="6"
      rx="1"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Rect
      x="15"
      y="13"
      width="6"
      height="6"
      rx="1"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path
      d="M9 8H13L11 6M11 10L13 8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 16H11L13 14M13 18L11 16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Return Icon - Box with curved return arrow
export const ReturnIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.warning,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 12V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 14V4M12 4L8 8M12 4L16 8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 8H8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

// Scanner Icon - Barcode scanner
export const ScannerIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7V5C4 4.44772 4.44772 4 5 4H7"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M17 4H19C19.5523 4 20 4.44772 20 5V7"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M20 17V19C20 19.5523 19.5523 20 19 20H17"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M7 20H5C4.44772 20 4 19.5523 4 19V17"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M3 12H21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M8 8V16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M12 8V16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M16 8V16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

// Supplier Icon - Building/vendor
export const SupplierIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 21H21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M5 21V7L12 3L19 7V21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 21V15H15V21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="10" r="2" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

// Purchase Order Icon - Clipboard with list
export const PurchaseOrderIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Rect
      x="9"
      y="3"
      width="6"
      height="4"
      rx="1"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path
      d="M9 12H15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M9 16H13"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

// Price Tag Icon
export const PriceTagIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 22V12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 7L12 12L2 7"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="7" r="1.5" fill={color} />
  </Svg>
);

// Forecast Icon - Chart with trend line
export const ForecastIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.primary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 21H21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M3 21V3"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M7 14L11 10L14 13L21 6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17 6H21V10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Alert Icon for pricing alerts
export const PricingAlertIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.warning,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L2 20H22L12 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 9V13"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Circle cx="12" cy="17" r="1" fill={color} />
  </Svg>
);

// Barcode generation icon
export const BarcodeGenIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="4"
      width="18"
      height="16"
      rx="2"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path d="M6 8V16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M9 8V16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M12 8V16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M15 8V16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M18 8V16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

// Adjustment/Inventory Icon - Clipboard with checkmarks and scale
export const AdjustmentIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Rect
      x="9"
      y="3"
      width="6"
      height="4"
      rx="1"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path
      d="M9 12L11 14L15 10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 17H15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

// Inbound Icon - Arrow pointing into warehouse
export const InboundIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.success,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 14V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V14"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 3V15M12 15L7 10M12 15L17 10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Outbound Icon - Arrow pointing out of warehouse
export const OutboundIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.error,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 14V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V14"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 15V3M12 3L7 8M12 3L17 8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Export all icons
export const WarehouseIcons = {
  StockIn: StockInIcon,
  WriteOff: WriteOffIcon,
  Transfer: TransferIcon,
  Return: ReturnIcon,
  Scanner: ScannerIcon,
  Supplier: SupplierIcon,
  PurchaseOrder: PurchaseOrderIcon,
  PriceTag: PriceTagIcon,
  Forecast: ForecastIcon,
  PricingAlert: PricingAlertIcon,
  BarcodeGen: BarcodeGenIcon,
  Adjustment: AdjustmentIcon,
  Inbound: InboundIcon,
  Outbound: OutboundIcon,
};

export default WarehouseIcons;
