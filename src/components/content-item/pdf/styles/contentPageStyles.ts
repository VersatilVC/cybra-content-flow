
import { StyleSheet } from '@react-pdf/renderer';

export const contentPageStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
    paddingTop: 80,
    paddingBottom: 80,
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10,
  },
  headerLogo: {
    width: 80,
    height: 'auto',
    objectFit: 'contain',
  },
  headerTitle: {
    fontSize: 10,
    color: '#6b7280',
    flex: 1,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 9,
    color: '#9ca3af',
  },
  pageNumber: {
    fontSize: 9,
    color: '#9ca3af',
  },
});
