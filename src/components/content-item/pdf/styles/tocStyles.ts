
import { StyleSheet } from '@react-pdf/renderer';

export const tocStyles = StyleSheet.create({
  tocPage: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  tocTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#8B5CF6',
    paddingBottom: 15,
  },
  tocItem: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tocDots: {
    flex: 1,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    marginHorizontal: 10,
    marginBottom: 3,
  },
});
