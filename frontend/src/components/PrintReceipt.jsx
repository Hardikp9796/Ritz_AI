import React, { forwardRef, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PrintReceipt = forwardRef(({ orderData, orderNumber }, ref) => {
  const [businessConfig, setBusinessConfig] = useState(null);

  useEffect(() => {
    fetchBusinessConfig();
  }, []);

  const fetchBusinessConfig = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/business-config`);
      setBusinessConfig(response.data);
    } catch (error) {
      console.error('Failed to load business config');
    }
  };

  const currentDate = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  if (!businessConfig) return null;

  return (
    <div ref={ref} style={{ display: 'none' }}>
      <div style={{
        width: '80mm',
        fontFamily: 'monospace',
        fontSize: '12px',
        padding: '10px',
        color: '#000',
        backgroundColor: '#fff'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '15px', borderBottom: '2px dashed #000', paddingBottom: '10px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0', letterSpacing: '2px' }}>
            {businessConfig.business_name}
          </h1>
          {businessConfig.tagline && (
            <p style={{ fontSize: '11px', margin: '3px 0' }}>{businessConfig.tagline}</p>
          )}
          {businessConfig.address_line1 && (
            <p style={{ fontSize: '10px', margin: '3px 0' }}>{businessConfig.address_line1}</p>
          )}
          {businessConfig.address_line2 && (
            <p style={{ fontSize: '10px', margin: '3px 0' }}>{businessConfig.address_line2}</p>
          )}
          <p style={{ fontSize: '10px', margin: '3px 0' }}>
            {businessConfig.city}{businessConfig.state ? `, ${businessConfig.state}` : ''}{businessConfig.pincode ? ` - ${businessConfig.pincode}` : ''}
          </p>
          {businessConfig.phone && (
            <p style={{ fontSize: '10px', margin: '3px 0' }}>Ph: {businessConfig.phone}</p>
          )}
          {businessConfig.gst_number && (
            <p style={{ fontSize: '10px', margin: '3px 0' }}>GST: {businessConfig.gst_number}</p>
          )}
        </div>

        {/* Order Info */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
            <span style={{ fontWeight: 'bold' }}>Order #:</span>
            <span style={{ fontWeight: 'bold' }}>{orderNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
            <span>Date:</span>
            <span>{currentDate}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
            <span>Type:</span>
            <span style={{ textTransform: 'uppercase' }}>{orderData.order_type}</span>
          </div>
          {orderData.table_token && (
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
              <span>Table/Token:</span>
              <span style={{ fontWeight: 'bold' }}>{orderData.table_token}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div style={{ borderTop: '2px dashed #000', borderBottom: '2px dashed #000', padding: '10px 0', marginBottom: '15px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>ITEMS:</div>
          {orderData.items.map((item, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px' }}>{item.item_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
                <span>{item.quantity} x ₹{item.price.toFixed(2)}</span>
                <span style={{ fontWeight: 'bold' }}>₹{(item.quantity * item.price).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0', fontSize: '13px' }}>
            <span>Subtotal:</span>
            <span>₹{orderData.total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '16px', fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '8px' }}>
            <span>TOTAL:</span>
            <span>₹{orderData.total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0', fontSize: '12px' }}>
            <span>Payment:</span>
            <span style={{ textTransform: 'uppercase' }}>{orderData.payment_type}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', borderTop: '2px dashed #000', paddingTop: '10px', fontSize: '11px' }}>
          <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{businessConfig.receipt_footer}</p>
          {businessConfig.receipt_footer_line2 && (
            <p style={{ margin: '5px 0' }}>{businessConfig.receipt_footer_line2}</p>
          )}
          {businessConfig.website && (
            <p style={{ margin: '5px 0', fontSize: '10px' }}>{businessConfig.website}</p>
          )}
          {businessConfig.email && (
            <p style={{ margin: '5px 0', fontSize: '10px' }}>{businessConfig.email}</p>
          )}
          <p style={{ margin: '8px 0', fontSize: '10px' }}>Powered by POCKETO POS</p>
        </div>
      </div>
    </div>
  );
});

PrintReceipt.displayName = 'PrintReceipt';

export default PrintReceipt;