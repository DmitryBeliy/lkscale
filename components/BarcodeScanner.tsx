import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string, type: string) => void;
  title?: string;
  description?: string;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  visible,
  onClose,
  onScan,
  title = 'Сканер',
  description = 'Наведите камеру на штрих-код или QR-код',
}) => {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
    if (visible) {
      setScanned(false);
    }
  }, [visible, permission, requestPermission]);

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Small delay for visual feedback
    setTimeout(() => {
      onScan(result.data, result.type);
      onClose();
    }, 300);
  };

  const toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlashOn(!flashOn);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const renderContent = () => {
    if (!permission) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка камеры...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.centered}>
          <Ionicons name="camera-outline" size={64} color={colors.textLight} />
          <Text style={styles.permissionTitle}>Требуется доступ к камере</Text>
          <Text style={styles.permissionText}>
            Разрешите приложению доступ к камере для сканирования штрих-кодов
          </Text>
          <Pressable style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Разрешить доступ</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={flashOn}
        barcodeScannerSettings={{
          barcodeTypes: [
            'qr',
            'ean13',
            'ean8',
            'code128',
            'code39',
            'code93',
            'upc_a',
            'upc_e',
            'pdf417',
            'aztec',
            'datamatrix',
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top */}
          <View style={styles.overlayTop}>
            <Text style={styles.overlayTitle}>{title}</Text>
            <Text style={styles.overlayDescription}>{description}</Text>
          </View>

          {/* Scanner Frame */}
          <View style={styles.scannerFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            {scanned && (
              <Animated.View
                entering={FadeIn.duration(200)}
                style={styles.scannedOverlay}
              >
                <Ionicons name="checkmark-circle" size={64} color={colors.success} />
              </Animated.View>
            )}
          </View>

          {/* Bottom */}
          <View style={styles.overlayBottom}>
            <Pressable
              style={styles.flashButton}
              onPress={toggleFlash}
            >
              <Ionicons
                name={flashOn ? 'flash' : 'flash-outline'}
                size={24}
                color={colors.textInverse}
              />
              <Text style={styles.flashButtonText}>
                {flashOn ? 'Выкл' : 'Вкл'}
              </Text>
            </Pressable>
          </View>
        </View>
      </CameraView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color={colors.textInverse} />
          </Pressable>
        </View>

        {/* Camera/Content */}
        {renderContent()}
      </View>
    </Modal>
  );
};

// Scanner button component for use in other screens
interface ScannerButtonProps {
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary';
}

export const ScannerButton: React.FC<ScannerButtonProps> = ({
  onPress,
  size = 'medium',
  variant = 'primary',
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const iconSize = size === 'small' ? 20 : size === 'large' ? 28 : 24;
  const buttonSize = size === 'small' ? 36 : size === 'large' ? 56 : 44;

  return (
    <Pressable
      style={[
        styles.scannerButton,
        { width: buttonSize, height: buttonSize },
        variant === 'secondary' && styles.scannerButtonSecondary,
      ]}
      onPress={handlePress}
    >
      <Ionicons
        name="scan-outline"
        size={iconSize}
        color={variant === 'primary' ? colors.textInverse : colors.primary}
      />
    </Pressable>
  );
};

const cornerStyle = {
  position: 'absolute' as const,
  width: 30,
  height: 30,
  borderColor: colors.primary,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  permissionTitle: {
    marginTop: spacing.lg,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  permissionText: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  permissionButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  permissionButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textInverse,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  overlayTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.textInverse,
    marginBottom: spacing.xs,
  },
  overlayDescription: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  scannerFrame: {
    width: 280,
    height: 280,
    alignSelf: 'center',
    position: 'relative',
  },
  cornerTL: {
    ...cornerStyle,
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    ...cornerStyle,
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    ...cornerStyle,
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    ...cornerStyle,
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scannedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,217,126,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  flashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  flashButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textInverse,
    fontWeight: '500',
  },
  scannerButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerButtonSecondary: {
    backgroundColor: `${colors.primary}15`,
  },
});
