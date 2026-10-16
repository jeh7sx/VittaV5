import { StyleSheet } from 'react-native';
import { ThemeColors, gerarTema } from '@/styles/themes';

const defaultTheme = gerarTema('ouro', 'claro');

export const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    contentContainer: {
      padding: 24,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: theme.textPrimary,
    },
    searchRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 32,
      alignItems: 'center',
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.cardBg,
      borderRadius: 24,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 48,
      fontSize: 15,
      color: theme.textPrimary,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    foldersContainer: {
      flexDirection: 'row',
    },
    folderCard: {
      backgroundColor: theme.cardBg,
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 24,
      width: 240,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 14,
      marginRight: 16,
    },
    folderCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    folderIconBg: {
      padding: 14,
      borderRadius: 16,
    },
    emptyText: {
      color: theme.textSecondary,
      fontStyle: 'italic',
      marginVertical: 12,
    },
    documentsList: {
      gap: 10,
    },

    documentCardWrapper: {
      backgroundColor: theme.cardBg,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    documentCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      justifyContent: 'space-between',
    },
    documentCardMobile: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 12,
    },
    docInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      flex: 2,
      overflow: 'hidden',
      paddingRight: 8,
    },
    docTypeBadge: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.inputBg,
      width: 44,
      height: 44,
      borderRadius: 14,
      overflow: 'hidden',
    },
    docNameDesc: {
      justifyContent: 'center',
      flex: 1,
    },
    docColumn: {
      flex: 1,
    },
    docActionColumn: {
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 8,
    },
    docActionColumnMobile: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 6,
    },
    docActionsIcons: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    iconButton: {
      padding: 4,
    },
    colorIndicatorRow: {
      flexDirection: 'row',
      height: 6,
      width: 70,
      borderRadius: 3,
      overflow: 'hidden',
    },
    colorIndicatorLine: {
      flex: 1,
      height: '100%',
    },

    /* MODAIS */
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modalContent: {
      width: 420,
      maxWidth: '100%',
      backgroundColor: theme.cardBg,
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingVertical: 28,
      gap: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 25,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.textPrimary,
    },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    items: {
      gap: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 14,
      fontSize: 15,
      color: theme.textPrimary,
      backgroundColor: theme.inputBg,
    },
    colorPickerContainer: {
      flexDirection: 'row',
      gap: 14,
    },
    colorOption: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
    },
    primaryButton: {
      backgroundColor: theme.yellow5,
      padding: 15,
      borderRadius: 20,
      alignItems: 'center',
      marginTop: 10,
    },
    primaryButtonText: {
      fontWeight: 'bold',
      fontSize: 15,
      color: theme.modo === 'escuro' ? '#000' : '#FFF',
    },
    filePickerButton: {
      borderWidth: 2,
      borderColor: theme.border,
      borderStyle: 'dashed',
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      backgroundColor: theme.inputBg,
      gap: 10,
    },
    folderSelectList: {
      maxHeight: 140,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 8,
      backgroundColor: theme.inputBg,
    },
    folderSelectItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      gap: 12,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxSelected: {
      backgroundColor: theme.yellow5,
      borderColor: theme.yellow5,
    },
    folderSelectIcon: {
      padding: 6,
      borderRadius: 8,
    },
    btnZipPasta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.inputBg,
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
    },
    previewContainer: {
      flex: 1,
      backgroundColor: theme.cardBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export const styles = getStyles(defaultTheme);