import React from 'react'
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';

export default function ChooseBusiness() {
  const navigate = useNavigate();

  const styles = {
        container: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          width: '100vw',
          height: '100vh',
        },
        image: {
          width: '150px',
          height: '150px',
          marginBottom: '40px',
        },
        title: {
          fontSize: '24px',
          marginBottom: '30px',
          textAlign: 'center',
          maxWidth: '100%',
          color: 'black'
        }
      };
            
      return (
        <div style={styles.container}>
            <img style={styles.image} src={logo} alt="logo" />
            <text style={styles.title}>What type of business do you run?</text>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <button className='primary_button' onClick={() => navigate('/business-raw-materials-login')}>
                    RAW MATERIAL
                </button>
                <button className='secondary_button' onClick={() => navigate('/business-new-products-expense-login')}>
                    NEW PROUDCTS EXPENSES
                </button>
            </div>
        </div>
    );
}
