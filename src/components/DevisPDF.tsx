import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Expertise, DevisItem } from '@/types';

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
}

export const DevisPDF: React.FC<Props> = ({ expertise }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>RepriseStore</Text>
          <Text style={styles.subtitle}>Boutique de Paris</Text>
          <Text style={styles.subtitle}>SIRET: 123 456 789 00012</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>DEVIS DE REPRISE</Text>
          <Text style={styles.subtitle}>N° {expertise.id}</Text>
          <Text style={styles.subtitle}>Date: {new Date(expertise.date).toLocaleDateString('fr-FR')}</Text>
          <Text style={styles.subtitle}>Type: {expertise.type === 'flotte' ? 'Lot B2B' : 'Unitaire'}</Text>
        </View>
      </View>

      <View style={styles.clientSection}>
        <Text style={styles.clientTitle}>Informations Client</Text>
        <Text>{expertise.client.firstName} {expertise.client.lastName}</Text>
        {expertise.client.company && <Text>Société: {expertise.client.company}</Text>}
        <Text>{expertise.client.email}</Text>
        <Text>{expertise.client.phone}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colModel}>Modèle</Text>
          <Text style={styles.colGrade}>Grade</Text>
          <Text style={styles.colQty}>Quantité</Text>
          <Text style={styles.colPrice}>Prix U.</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>
        
        {expertise.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.colModel}>
              <Text>
                {item.device.brand !== "Prestation" ? `${item.device.brand} ` : ""}{item.device.model} {item.device.storage ? `- ${item.device.storage}` : ''}
                {item.device.imei ? `\nIMEI: ${item.device.imei}` : ''}
              </Text>
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
            <Text>Nb. Appareils :</Text>
            <Text>{expertise.items.reduce((acc, i) => acc + i.quantity, 0)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 10, borderTopWidth: 1, borderTopColor: '#666', paddingTop: 10 }]}>
            <Text style={styles.totalText}>Total Proposé</Text>
            <Text style={styles.totalText}>{expertise.totalProposedPrice} €</Text>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>
        Ce devis est valable 15 jours à compter de sa date d'émission. L'offre de reprise définitive est soumise à la vérification physique du matériel. 
        Pour valider ce devis, veuillez retourner ce document signé avec la mention "Bon pour accord".
      </Text>
    </Page>
  </Document>
);
