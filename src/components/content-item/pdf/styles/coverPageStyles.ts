
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
    paddingHorizontal: 20, // Add horizontal padding for better text flow
  },
  coverTitle: {
    fontSize: 28, // Slightly reduced from 32 to allow more room for wrapping
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 1.4, // Increased line height for better spacing
    wordWrap: 'break-word', // Break words only when necessary
    hyphens: 'none', // Disable hyphenation
    overflow: 'hidden', // Prevent text overflow
    maxWidth: '100%', // Ensure title doesn't exceed container width
  },
  coverSubtitle: {
    fontSize: 14, // Slightly reduced from 16 for better proportion
    color: '#6b7280',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 1.6, // Increased line height for better readability
    wordWrap: 'break-word', // Break words only when necessary
    hyphens: 'none', // Disable hyphenation
    maxWidth: '100%', // Ensure subtitle doesn't exceed container width
    paddingHorizontal: 10, // Add some padding for better text flow
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
