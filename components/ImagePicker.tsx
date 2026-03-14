import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ExpoImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { logger } from '@/lib/logger';

interface ImagePickerProps {
  currentImage?: string;
  onImageSelected: (uri: string, base64: string) => Promise<void>;
  size?: 'small' | 'medium' | 'large';
  shape?: 'square' | 'circle';
  placeholder?: string;
  disabled?: boolean;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  currentImage,
  onImageSelected,
  size = 'medium',
  shape = 'square',
  placeholder = 'Добавить фото',
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [localImage, setLocalImage] = useState<string | undefined>(currentImage);

  const sizeMap = {
    small: 70,
    medium: 120,
    large: 200,
  };

  const imageSize = sizeMap[size];

  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Разрешение требуется',
        'Для загрузки изображений необходимо разрешение на доступ к фотографиям.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (disabled || isUploading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: shape === 'circle' ? [1, 1] : [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setLocalImage(asset.uri);
      setIsUploading(true);

      try {
        await onImageSelected(asset.uri, asset.base64 || '');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        logger.error('Error uploading image:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Ошибка', 'Не удалось загрузить изображение');
        setLocalImage(currentImage);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const takePhoto = async () => {
    if (disabled || isUploading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Разрешение требуется',
        'Для съёмки фото необходимо разрешение на доступ к камере.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ExpoImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: shape === 'circle' ? [1, 1] : [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setLocalImage(asset.uri);
      setIsUploading(true);

      try {
        await onImageSelected(asset.uri, asset.base64 || '');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        logger.error('Error uploading image:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Ошибка', 'Не удалось загрузить изображение');
        setLocalImage(currentImage);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const showOptions = () => {
    Alert.alert(
      'Выберите источник',
      'Откуда загрузить изображение?',
      [
        {
          text: 'Камера',
          onPress: takePhoto,
        },
        {
          text: 'Галерея',
          onPress: pickImage,
        },
        {
          text: 'Отмена',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <Pressable
      style={[
        styles.container,
        {
          width: imageSize,
          height: imageSize,
          borderRadius: shape === 'circle' ? imageSize / 2 : borderRadius.lg,
        },
        disabled && styles.disabled,
      ]}
      onPress={showOptions}
      disabled={disabled || isUploading}
    >
      {localImage ? (
        <Animated.View entering={FadeIn.duration(300)} style={styles.imageContainer}>
          <Image
            source={{ uri: localImage }}
            style={[
              styles.image,
              {
                width: imageSize,
                height: imageSize,
                borderRadius: shape === 'circle' ? imageSize / 2 : borderRadius.lg,
              },
            ]}
          />
          {isUploading && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              style={styles.uploadingOverlay}
            >
              <ActivityIndicator size="large" color={colors.textInverse} />
              <Text style={styles.uploadingText}>Загрузка...</Text>
            </Animated.View>
          )}
          {!isUploading && (
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={14} color={colors.textInverse} />
            </View>
          )}
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(300)} style={styles.placeholder}>
          {isUploading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="camera-outline" size={size === 'small' ? 20 : 28} color={colors.primary} />
              </View>
              {size !== 'small' && (
                <Text style={styles.placeholderText}>{placeholder}</Text>
              )}
            </>
          )}
        </Animated.View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    ...shadows.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: colors.textInverse,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  editBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  placeholderText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default ImagePicker;
