import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Platform,
  Vibration,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { logger } from '@/lib/logger';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { warehouseColors } from './WarehouseButton';
import { ScannerIcon } from './WarehouseIcons';

interface WarehouseScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string, type: string) => void;
  title?: string;
  description?: string;
  mode?: 'single' | 'continuous';
  scanDelay?: number;
  showManualEntry?: boolean;
  onManualEntry?: () => void;
}

export const WarehouseScanner: React.FC<WarehouseScannerProps> = ({
  visible,
  onClose,
  onScan,
  title = 'Сканирование',
  description = 'Наведите камеру на штрих-код товара',
  mode = 'single',
  scanDelay = 2000,
  showManualEntry = true,
  onManualEntry,
}) => {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [showGreenFlash, setShowGreenFlash] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Animation values
  const scanLinePosition = useSharedValue(0);
  const successScale = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.3);
  const flashOpacity = useSharedValue(0);

  // Load beep sound
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
          { shouldPlay: false }
        );
        soundRef.current = sound;
      } catch (error) {
        logger.debug('Could not load beep sound:', error);
      }
    };
    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Play beep sound
  const playBeep = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }
    } catch (error) {
      logger.debug('Could not play beep:', error);
    }
  };

  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
    if (visible) {
      setScanned(false);
      setLastScannedCode(null);
      // Start scan line animation
      scanLinePosition.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0, { duration: 2000 })
        ),
        -1,
        false
      );
      // Pulse animation
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [visible, permission, requestPermission, scanLinePosition, pulseOpacity]);

  const triggerGreenFlash = useCallback(() => {
    setShowGreenFlash(true);
    setTimeout(() => setShowGreenFlash(false), 400);
  }, []);

  const handleBarCodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (scanned && mode === 'single') return;
    if (lastScannedCode === result.data && mode === 'continuous') return;

    setScanned(true);
    setLastScannedCode(result.data);
    setScanCount((prev) => prev + 1);

    // Play beep sound
    playBeep();

    // Strong haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 100, 50, 100]);
    }

    // Green flash effect
    flashOpacity.value = withSequence(
      withTiming(0.7, { duration: 100 }),
      withTiming(0, { duration: 300 })
    );
    runOnJS(triggerGreenFlash)();

    // Success animation
    successScale.value = withSequence(
      withSpring(1.3, { damping: 6, stiffness: 200 }),
      withSpring(1, { damping: 10 })
    );

    // Process scan
    setTimeout(() => {
      onScan(result.data, result.type);
      if (mode === 'single') {
        onClose();
      } else {
        // Reset for continuous scanning
        setTimeout(() => {
          setScanned(false);
        }, scanDelay);
      }
    }, 400);
  }, [scanned, mode, lastScannedCode, onScan, onClose, scanDelay, successScale, flashOpacity, triggerGreenFlash]);

  const toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFlashOn(!flashOn);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleManualEntry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onManualEntry?.();
    onClose();
  };

  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${scanLinePosition.value * 100}%`,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const successStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const renderContent = () => {
    if (!permission) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={warehouseColors.scan} />
          <Text style={styles.loadingText}>Инициализация камеры...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.centered}>
          <View style={styles.permissionIcon}>
            <ScannerIcon size={64} color={colors.textLight} />
          </View>
          <Text style={styles.permissionTitle}>Требуется доступ к камере</Text>
          <Text style={styles.permissionText}>
            Для сканирования штрих-кодов необходимо разрешить доступ к камере
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
            'itf14',
            'codabar',
          ],
        }}
        onBarcodeScanned={(scanned && mode === 'single') ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          {/* Top section */}
          <View style={styles.overlayTop}>
            <Animated.View entering={SlideInUp.delay(200)}>
              <Text style={styles.overlayTitle}>{title}</Text>
              <Text style={styles.overlayDescription}>{description}</Text>
            </Animated.View>
          </View>

          {/* Scanner frame - LARGE for warehouse use */}
          <View style={styles.scannerFrameContainer}>
            <Animated.View style={[styles.pulseFrame, pulseStyle]} />
            <View style={styles.scannerFrame}>
              {/* Corner markers - BOLD */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />

              {/* Scan line */}
              <Animated.View style={[styles.scanLine, scanLineStyle]} />

              {/* Success overlay */}
              {scanned && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={[styles.scannedOverlay, successStyle]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={80}
                    color={warehouseColors.success}
                  />
                  <Text style={styles.scannedText}>Отсканировано!</Text>
                </Animated.View>
              )}
            </View>
          </View>

          {/* Bottom section with LARGE buttons */}
          <View style={styles.overlayBottom}>
            {mode === 'continuous' && (
              <View style={styles.scanCounter}>
                <Text style={styles.scanCounterText}>
                  Отсканировано: {scanCount}
                </Text>
              </View>
            )}

            <View style={styles.buttonRow}>
              {/* Flash toggle - LARGE */}
              <Pressable
                style={[
                  styles.actionButton,
                  flashOn && styles.actionButtonActive,
                ]}
                onPress={toggleFlash}
              >
                <Ionicons
                  name={flashOn ? 'flash' : 'flash-outline'}
                  size={32}
                  color={flashOn ? warehouseColors.warning : colors.textInverse}
                />
                <Text style={styles.actionButtonText}>
                  {flashOn ? 'Выкл' : 'Подсветка'}
                </Text>
              </Pressable>

              {/* Manual entry - LARGE */}
              {showManualEntry && onManualEntry && (
                <Pressable
                  style={styles.actionButton}
                  onPress={handleManualEntry}
                >
                  <Ionicons
                    name="keypad-outline"
                    size={32}
                    color={colors.textInverse}
                  />
                  <Text style={styles.actionButtonText}>Ввод вручную</Text>
                </Pressable>
              )}
            </View>

            {lastScannedCode && mode === 'continuous' && (
              <View style={styles.lastScanned}>
                <Text style={styles.lastScannedLabel}>Последний код:</Text>
                <Text style={styles.lastScannedCode}>{lastScannedCode}</Text>
              </View>
            )}
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
        {/* Header with LARGE close button */}
        <View style={styles.header}>
          <Pressable
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="close" size={36} color={colors.textInverse} />
          </Pressable>
        </View>

        {renderContent()}

        {/* GREEN FLASH OVERLAY for successful scan */}
        {showGreenFlash && (
          <Animated.View
            entering={FadeIn.duration(100)}
            exiting={FadeOut.duration(200)}
            style={styles.greenFlashOverlay}
          >
            <View style={styles.greenFlashContent}>
              <Ionicons name="checkmark-circle" size={120} color="#fff" />
              <Text style={styles.greenFlashText}>✓ Отсканировано</Text>
            </View>
          </Animated.View>
        )}

        {/* Animated flash overlay */}
        <Animated.View
          style={[styles.flashOverlay, flashStyle]}
          pointerEvents="none"
        />

        {/* Safe area bottom */}
        <View style={{ height: insets.bottom }} />
      </View>
    </Modal>
  );
};

const FRAME_SIZE = 320;
const CORNER_SIZE = 50;
const CORNER_WIDTH = 6;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.lg,
  },
  closeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
    marginTop: spacing.lg,
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  permissionIcon: {
    marginBottom: spacing.lg,
    opacity: 0.6,
  },
  permissionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  permissionText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  permissionButton: {
    backgroundColor: warehouseColors.scan,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  permissionButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.textInverse,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlayTop: {
    flex: 0.3,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  overlayTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800',
    color: colors.textInverse,
    marginBottom: spacing.xs,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  overlayDescription: {
    fontSize: typography.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  scannerFrameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.5,
  },
  pulseFrame: {
    position: 'absolute',
    width: FRAME_SIZE + 20,
    height: FRAME_SIZE + 20,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: warehouseColors.scan,
  },
  scannerFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: warehouseColors.scan,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomRightRadius: 16,
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: warehouseColors.scan,
    borderRadius: 2,
  },
  scannedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,230,118,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  scannedText: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: warehouseColors.success,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  overlayBottom: {
    flex: 0.35,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  scanCounter: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  scanCounterText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textInverse,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionButton: {
    minWidth: 100,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButtonActive: {
    backgroundColor: 'rgba(255,234,0,0.3)',
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textInverse,
  },
  lastScanned: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  lastScannedLabel: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  lastScannedCode: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textInverse,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  greenFlashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 200, 83, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  greenFlashContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenFlashText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginTop: spacing.lg,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00E676',
    zIndex: 99,
  },
});

export default WarehouseScanner;
