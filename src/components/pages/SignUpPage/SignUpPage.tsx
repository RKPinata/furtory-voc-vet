import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import Button from 'components/atoms/Button';
import Input, { useTextInput } from 'components/atoms/Input';
import * as fonts from 'styles/fonts';

import { media } from 'utils';
import { CREATE_USER } from 'graphql/mutations';
import { ApolloError, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { ErrorMessage } from 'components/atoms/Toast';

const FormContainer = styled.form`
  width: 100%;
  box-sizing: border-box;
  padding: 0 24px;
  margin-top: 100px;
  background-color: var(--white);
  
  ${Input} {
    margin-bottom: 16px;
  }
  
  ${media.main} {
    max-width: 500px;
    border: solid 1px #dee2f2;
    border-radius: 4px;
    padding: 0 48px;
  }
`;

const InputLabel = styled.label`
  ${fonts.small};
  ${fonts.heavy};
  height: 12px;
  display: inline-block;
  margin-top: 6px;
  margin-bottom: 6px;
  &:first-of-type {
    margin-top: 38px;
  }
`;

const SignUpButton = styled(Button)`
  ${fonts.normal};
  ${fonts.demi};
  color: var(--white);
  width: 100%;
  margin-bottom: 40px;
`;

// Login user
// if user already exists, then go to dashboard
// else go to description details page then after submit go to dashboard
interface SignUpPageProps { }
const SignUpPage = (props: SignUpPageProps) => {
  const [fullName, fullNameInput] = useTextInput({ id: 'fullNameInput', initValue: '' });
  const [username, usernameInput] = useTextInput({ id: 'usernameInput', initValue: '' });
  const [password, passwordInput] = useTextInput({ id: 'passwordInput', initValue: '', type: 'password' });
  const [qualification, qualificationInput] = useTextInput({ id: 'qualificationInput', initValue: '' });

  const history = useHistory();

  const [graphSignUp, result] = useMutation(CREATE_USER, {
    onError: (error) => {
      toast.error(<ErrorMessage message={error.graphQLErrors[0].message} />);
    }
  })

  // TODO
  const signUp = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();

    await graphSignUp({ variables: { username, name: fullName, qualification } });

    history.push('/');
  }

  return (
    <FormContainer>
      <InputLabel htmlFor="usernameInput">Username</InputLabel>
      {usernameInput}
      <InputLabel htmlFor="passwordInput">Password</InputLabel>
      {passwordInput}
      <InputLabel htmlFor="fullNameInput">Full Name</InputLabel>
      {fullNameInput}
      <InputLabel htmlFor="qualificationInput">Qualification</InputLabel>
      {qualificationInput}
      <SignUpButton
        primary
        size="mid"
        onClick={signUp}
      >
        Sign up
      </SignUpButton>
    </FormContainer>
  );
};

export default SignUpPage;
