
import { StyleSheet } from '@react-pdf/renderer';

export const coverPageStyles = StyleSheet.create({
  coverPage: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 60,
    fontFamily: 'Helvetica',
    justifyContent: 'space-between',
    minHeight: '100vh',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 'auto',
    objectFit: 'contain',
  },
  coverContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 1.3,
  },
  coverSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 1.5,
  },
  coverFooter: {
    borderTop: 2,
    borderTopColor: '#8B5CF6',
    paddingTop: 20,
    alignItems: 'center',
  },
  coverDate: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
