import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Expertise } from '@/types';
import type { TFunction } from 'i18next';
import { colorLabel, formatDate } from '@/lib/format';

// Par défaut react-pdf coupe les mots en fin de ligne (« Titane na-turel ») :
// on renvoie le mot entier pour qu'il passe simplement à la ligne suivante.
Font.registerHyphenationCallback(word => [word]);

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#1E1E24',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E07A5F', // Terracotta
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  clientSection: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#F4F4F9',
    borderRadius: 8,
  },
  clientTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: 20,
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E1D9',
    paddingBottom: 8,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F9',
  },
  colModel: { width: '40%' },
  itemDetail: { fontSize: 9, color: '#666666', marginTop: 2 },
  colGrade: { width: '15%', textAlign: 'center' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '15%', textAlign: 'right' },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  totalBox: {
    width: 200,
    padding: 15,
    backgroundColor: '#1E1E24',
    color: '#FFFFFF',
    borderRadius: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  notesBox: {
    width: '55%',
  },
  signatureBox: {
    width: '40%',
    height: 90,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E8E1D9',
    borderRadius: 8,
    fontSize: 9,
    color: '#666666',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#999999',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#E8E1D9',
    paddingTop: 10,
  }
});

interface Props {
  expertise: Expertise;
  /** Passée par l'appelant : le PDF est rendu hors de l'arbre React de la page. */
  t: TFunction;
}

export const DevisPDF: React.FC<Props> = ({ expertise, expertise: { client }, t }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>RepriseStore</Text>
          <Text style={styles.subtitle}>{t('pdf.shop_subtitle')}</Text>
          <Text style={styles.subtitle}>{t('pdf.shop_siret', { siret: '123 456 789 00012' })}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{t('pdf.title')}</Text>
          <Text style={styles.subtitle}>{t('pdf.number', { id: expertise.id })}</Text>
          <Text style={styles.subtitle}>{t('pdf.date', { date: formatDate(expertise.date) })}</Text>
          <Text style={styles.subtitle}>{t('pdf.type', { type: t(expertise.type === 'flotte' ? 'pdf.type_fleet' : 'pdf.type_unit') })}</Text>
        </View>
      </View>

      <View style={styles.clientSection}>
        <Text style={styles.clientTitle}>{t('pdf.client_info')}</Text>
        {client.company && <Text style={{ fontWeight: 'bold' }}>{client.company}</Text>}
        {client.siret && <Text>{t('pdf.siret', { siret: client.siret })}</Text>}
        <Text>{client.company ? t('pdf.contact') : ''}{client.firstName} {client.lastName}</Text>
        {client.address && <Text>{client.address}</Text>}
        {(client.postalCode || client.city) && <Text>{[client.postalCode, client.city].filter(Boolean).join(' ')}</Text>}
        {client.email && <Text>{client.email}</Text>}
        {client.phone && <Text>{client.phone}</Text>}
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colModel}>{t('pdf.col_model')}</Text>
          <Text style={styles.colGrade}>{t('pdf.col_grade')}</Text>
          <Text style={styles.colQty}>{t('pdf.col_qty')}</Text>
          <Text style={styles.colPrice}>{t('pdf.col_unit_price')}</Text>
          <Text style={styles.colTotal}>{t('pdf.col_total')}</Text>
        </View>
        
        {expertise.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.colModel}>
              <Text>{item.device.brand !== "Prestation" ? `${item.device.brand} ` : ""}{item.device.model}</Text>
              {(item.device.storage || item.device.color) && (
                <Text style={styles.itemDetail}>{[item.device.storage, item.device.color && colorLabel(item.device.color)].filter(Boolean).join(' · ')}</Text>
              )}
              {item.device.imei && <Text style={styles.itemDetail}>{t('pdf.imei', { imei: item.device.imei })}</Text>}
              {item.device.serialNumber && <Text style={styles.itemDetail}>{t('pdf.serial', { serial: item.device.serialNumber })}</Text>}
            </View>
            <Text style={styles.colGrade}>{item.device.brand === "Prestation" ? "-" : item.grade}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>{item.unitPrice} €</Text>
            <Text style={styles.colTotal}>{item.unitPrice * item.quantity} €</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalSection}>
        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text>{t('pdf.device_count')}</Text>
            <Text>{expertise.items.reduce((acc, i) => acc + i.quantity, 0)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 10, borderTopWidth: 1, borderTopColor: '#666', paddingTop: 10 }]}>
            <Text style={styles.totalText}>{t('pdf.total')}</Text>
            <Text style={styles.totalText}>{expertise.totalProposedPrice} €</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.notesBox}>
          {expertise.notes && (
            <>
              <Text style={styles.clientTitle}>{t('pdf.notes')}</Text>
              <Text>{expertise.notes}</Text>
            </>
          )}
        </View>
        <View style={styles.signatureBox}>
          <Text>{t('pdf.signature_1')}</Text>
          <Text>{t('pdf.signature_2')}</Text>
        </View>
      </View>

      <Text style={styles.footer}>{t('pdf.footer')}</Text>
    </Page>
  </Document>
);
