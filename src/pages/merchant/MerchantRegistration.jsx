import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function MerchantRegistration() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const initialValues = {
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    businessType: '',
    description: '',
    panCard: '',
    aadharCard: '',
    gstin: ''
  };

  const validationSchema = Yup.object({
    businessName: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email format').required('Required'),
    password: Yup.string().required('Required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), ''], 'Passwords must match')
      .required('Required'),
    phone: Yup.string().required('Required'),
    address: Yup.string().required('Required'),
    businessType: Yup.string().required('Required'),
    description: Yup.string().required('Required'),
    panCard: Yup.string().required('Required'),
    aadharCard: Yup.string().required('Required'),
    gstin: Yup.string().required('Required')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/merchant/register', values);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/merchant/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating merchant account');
      setTimeout(() => setError(''), 3000);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-8">Merchant Registration</h2>
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div>
                <Field
                  type="text"
                  name="businessName"
                  placeholder="Business Name"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <ErrorMessage name="businessName" component="div" className="text-red-500" />
              </div>

              <div>
                <Field
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <ErrorMessage name="email" component="div" className="text-red-500" />
              </div>

              <div>
                <Field
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <ErrorMessage name="phone" component="div" className="text-red-500" />
              </div>

              <div>
                <Field
                  type="text"
                  name="address"
                  placeholder="Business Address"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <ErrorMessage name="address" component="div" className="text-red-500" />
              </div>

              <div>
                <Field
                  as="select"
                  name="businessType"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Business Type</option>
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="service">Service Provider</option>
                </Field>
                <ErrorMessage name="businessType" component="div" className="text-red-500" />
              </div>

              <div>
                <Field
                  as="textarea"
                  name="description"
                  placeholder="Business Description"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  rows="3"
                />
                <ErrorMessage name="description" component="div" className="text-red-500" />
              </div>

              <div>
                <Field
                  type="text"
                  name="panCard"
                  placeholder="PAN Card"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <ErrorMessage name="panCard" component="div" className="text-red-500" />
              </div>

              <div>
                <Field
                  type="text"
                  name="aadharCard"
                  placeholder="Aadhar Card"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <ErrorMessage name="aadharCard" component="div" className="text-red-500" />
              </div>

              <div>
                <Field
                  type="text"
                  name="gstin"
                  placeholder="GSTIN"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <ErrorMessage name="gstin" component="div" className="text-red-500" />
              </div>

              <div>
                <Field
                  type="password"
                  name="password"
                  placeholder="Create Password"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <ErrorMessage name="password" component="div" className="text-red-500" />
              </div>

              <div>
                <Field
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <ErrorMessage name="confirmPassword" component="div" className="text-red-500" />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                disabled={isSubmitting}
              >
                Register as Merchant
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-6 text-center">
          <span className="text-gray-400">Already have a merchant account? </span>
          <Link to="/merchant/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default MerchantRegistration;