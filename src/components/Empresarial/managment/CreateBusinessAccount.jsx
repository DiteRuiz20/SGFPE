import React, { useState } from 'react';
import logo from '../../../assets/logo.png';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Plase enter a valid email').required('Email is required'),
    address: yup.string(),
    phoneNumber : yup.number().positive('Phone number must be positive').min(10, 'The phone number should be 10 digits').required('Phone number is required').transform((value, originalValue) => (originalValue === '' ? undefined : value)),
    password: yup.string().min(6, 'Password should be at least 6 characters').required('Password is required'),
});

export default function CreatePersonalAccount() {
    const [users, setUsers] = useState([]);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
    });
  const customSubmit = () => {
        handleSubmit(onSubmit)();
    };

    const styles = {
        fatherContainer: {
            marginTop: 40,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'white',
            width: '80vw',
        },
        upperContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            width: '100vw',
            height: '100vh',
        },
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
        },
        image: {
          width: 130,
          height: 130,
          marginBottom: 30,
        },
        subtitle: {
          alignSelf: 'center',
          fontSize: 16,
          color: '#444',
          marginBottom: 20,
        },
        title: {
          fontSize: 28,
          fontWeight: 'bold',
          color: '#30437A',
          marginBottom: 20,
        },
        input: {
            width: 444,
            height: 20,
            backgroundColor: '#EAEAEA',
            padding: 15,
            borderWidth: 0,
            borderRadius: 8,
            color: 'black',
            marginBottom: 15,
            boxShadow: '0px 2px 2px rgba(136, 136, 136, 0.5)',
        },
        primary_button: {
          width: '100%',
          backgroundColor: '#30437A',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 15,
          shadowColor: '#30387a',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 2,
        },
        orText: {
          fontSize: 14,
          color: '#666',
          backgroundColor: 'white',
          top: -23,
        },
        getStarted: {
          color: '#666',
          fontSize: 14,
          marginBottom: 15,
        },
        secondary_button: {
          width: '100%',
          backgroundColor: '#3DC9A7',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          shadowColor: '#3dc1ad',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 2,
        },
        button_text: {
          color: 'white',
          fontSize: 16,
        },
      };

      return (
        <div style={styles.upperContainer}>
          <text style={styles.subtitle}>Thanks for joining us!</text>
          <text style={styles.subtitle}>Please fill out the required data about you.</text>
          <div style={styles.fatherContainer}>
              <div style={styles.container}>
                <form>
                  <div>
                    <input style={styles.input}
                      type="text"
                      {...register('name')}
                      placeholder="Business Name"
                    />
                    {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
                  </div>
  
                  <div>
                    <input style={styles.input}
                      type="email"
                      {...register('email')}
                      placeholder="Email Address"
                    />
                    {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
                  </div>

                  <div>
                    <input style={styles.input}
                      type="text"
                      {...register('phoneNumber')}
                      placeholder="PhoneNumber"
                    />
                    {errors.phone && <p style={{ color: 'red' }}>{errors.phone.message}</p>}
                  </div>

                  <div>
                    <input style={styles.input}
                      type="text"
                      {...register('address')}
                      placeholder="Address (Optional)"
                    />
                    {errors.address && <p style={{ color: 'red' }}>{errors.address.message}</p>}
                  </div>
  
                  <div>
                    <input style={styles.input}
                      type="password"
                      {...register('password')}
                      placeholder="Password"
                    />
                    {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
                  </div>
                </form>
              </div>
              <div style={styles.container}>
                  <img style={styles.image} src={logo} alt="logo" />
                  <text style={styles.subtitle}>Note:</text>
                  <text style={styles.subtitle}>You will be sent a confirmation code via email, which will be used to authenticate your account.</text>
                  <button className='secondary_button' type="button" onClick={customSubmit}>SIGN UP</button>
              </div>
          </div>        
        </div>
      );
}
