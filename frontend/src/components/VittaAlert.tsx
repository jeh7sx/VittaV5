// components/VittaAlert.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertOptions {
  type?: AlertType;
  showCancel?: boolean;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertData extends AlertOptions {
  visible: boolean;
  title: string;
  message: string;
}

interface VittaAlertContextData {
  showAlert: (title: string, message: string, options?: AlertOptions) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
  hideAlert: () => void;
}

const VittaAlertContext = createContext<VittaAlertContextData>({} as VittaAlertContextData);

export const VittaAlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const [alert, setAlert] = useState<AlertData>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    showCancel: false,
    cancelText: 'Cancelar',
    confirmText: 'Entendido',
  });

  const showAlert = (title: string, message: string, options: AlertOptions = {}) => {
    setAlert({
      visible: true,
      title,
      message,
      type: options.type || 'info',
      showCancel: options.showCancel || false,
      cancelText: options.cancelText || 'Cancelar',
      confirmText: options.confirmText || 'Entendido',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    });
  };

  const showConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ) => {
    showAlert(title, message, {
      type: 'warning',
      showCancel: true,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      onConfirm,
      onCancel,
    });
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  const handleConfirm = () => {
    if (alert.onConfirm) alert.onConfirm();
    hideAlert();
  };

  const handleCancel = () => {
    if (alert.onCancel) alert.onCancel();
    hideAlert();
  };

  return (
    <VittaAlertContext.Provider value={{ showAlert, showConfirm, hideAlert }}>
      {children}

      <Modal
        transparent
        visible={alert.visible}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.overlay}>
          <View 
            style={[
              styles.container, 
              { 
                backgroundColor: theme.cardBg, 
                borderColor: theme.border,
                shadowColor: theme.black 
              }
            ]}
          >
            {/* Cabeçalho do Alerta */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {alert.title}
              </Text>
              
              {/* Botão X para fechar */}
              <TouchableOpacity 
                onPress={handleCancel} 
                style={[styles.closeButton, { backgroundColor: theme.inputBg }]}
              >
                <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Mensagem */}
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              {alert.message}
            </Text>

            {/* Botões de Ação */}
            <View style={styles.actionContainer}>
              {alert.showCancel && (
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                  onPress={handleCancel}
                >
                  <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
                    {alert.cancelText}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.button, 
                  { backgroundColor: alert.showCancel ? (theme.delete || '#E11D48') : theme.yellow5 },
                  alert.showCancel && { flex: 1 }
                ]}
                onPress={handleConfirm}
              >
                <Text style={[styles.buttonText, { color: alert.showCancel ? theme.white : theme.yellow9 }]}>
                  {alert.confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </VittaAlertContext.Provider>
  );
};

export function useVittaAlert() {
  return useContext(VittaAlertContext);
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  cancelButton: {
    borderWidth: 1,
    flex: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});