import React from 'react'
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';

export default function ChooseBusiness() {
  const navigate = useNavigate();

  const styles = {
    image: {
      width: '150px',
      height: '150px',
      marginBottom: '40px',
    },
    title: {
      fontSize: '26px',
      marginBottom: '30px',
      textAlign: 'center',
      maxWidth: '80%',
      color: 'black',
      marginHorizontal: '6px',
    }
  };
            
      return (
      <div className="background-container align-content-center">
        <div className='container d-flex flex-column align-items-center justify-content-center'>
            <img className='col-4' style={styles.image} src={logo} alt="logo" />
            <p style={styles.title}>¿Qué tipo de empresa manejas?</p>
            <div className='d-flex flex-column col-sm-4'>
                <button className='primary_button' onClick={() => navigate('/business-raw-materials-login')}>
                    MATERIA PRIMA
                </button>
                <button className='secondary_button' onClick={() => navigate('/business-new-products-expense-login')}>
                    NUEVOS PRODUCTOS
                </button>
            </div>
        </div>
      </div>
    );
}
