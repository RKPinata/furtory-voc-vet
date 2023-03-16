import { ErrorMessage } from 'components/atoms/Toast';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-use';
import styled from 'styled-components';
import { Link, useHistory } from 'react-router-dom';

import Button from 'components/atoms/Button';
import Input, { useTextInput } from 'components/atoms/Input';
import { useSbCalls } from 'lib/sendbird-calls';
import { SoundType } from 'sendbird-calls';
import type { AuthOption } from 'sendbird-calls';
import { toast } from 'react-toastify';
import storage from 'lib/storage';
import * as fonts from 'styles/fonts';

import { media } from 'utils';
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from 'graphql/mutations';

const FormContainer = styled.form`
  width: 100%;
  box-sizing: border-box;
  padding: 0 24px;
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

const LoginButton = styled(Button)`
  ${fonts.normal};
  ${fonts.demi};
  color: var(--white);
  width: 100%;
  margin-bottom: 40px;
`;

// Login user
// if user already exists, then go to dashboard
// else go to description details page then after submit go to dashboard
interface LoginFormProps { }
const LoginForm = (props: LoginFormProps) => {
  const sbCalls = useSbCalls();
  const history = useHistory();
  const query = new URLSearchParams(useLocation().search);
  let authArgs: any = {};
  const authQuery = query.get('q');
  if (authQuery) {
    try {
      authArgs = JSON.parse(atob(authQuery));
    } catch (e) { }
  }

  const stored = storage.getItem('sbCalls');

  const APP_ID = process.env.REACT_APP_APP_ID || authArgs.app_id || stored?.appId || '';
  const ACCESS_TOKEN = authArgs.access_token || stored?.accessToken || process.env.REACT_APP_ACCESS_TOKEN || '';
  const IS_ACCESS_TOKEN_NEEDED = process.env.REACT_APP_IS_ACCESS_TOKEN_NEEDED === 'true';
  const [username, usernameInput] = useTextInput({ id: 'usernameInput', initValue: '' });
  const [password, passwordInput] = useTextInput({ id: 'passwordInput', initValue: '', type: 'password' });

  const [graph_login, result] = useMutation(LOGIN_USER, {
    onCompleted: () => {
      const token = result.data.login.value
      localStorage.setItem('furtory-vet-token', token)
      history.replace("/dashboard");
    },
    onError: (error) => {
      toast.error(<ErrorMessage message={`Check entered information and try again.`} />, { autoClose: 2000 });
    }
  })

  const loginSendBird = async () => {
    const option: AuthOption = { userId: username };
    if (IS_ACCESS_TOKEN_NEEDED || authArgs.access_token) option.accessToken = ACCESS_TOKEN;
    // will use these in chat screen
    // await sbCalls.addDirectCallSound(SoundType.DIALING, '/sounds/Dialing.mp3');
    // await sbCalls.addDirectCallSound(SoundType.RINGING, '/sounds/Ringing.mp3');
    // await sbCalls.addDirectCallSound(SoundType.RECONNECTING, '/sounds/Reconnecting.mp3');
    // await sbCalls.addDirectCallSound(SoundType.RECONNECTED, '/sounds/Reconnected.mp3');
    try {
      sbCalls.init(APP_ID);
      await sbCalls.auth(option);
      storage.setItem('sbCalls', { appId: APP_ID, userId: username });
      // history.push(`${query.get('referrer') ? query.get('referrer') + `?room_id=${ROOM_ID}` : '/'}`);
    } catch (error) {
      throw new Error();
      // toast.error(<ErrorMessage message={`Check entered information and try again.`} />, { autoClose: 2000 });
    }
  }

  // logs in on both sendbird and graphql backend
  const login = async (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event?.preventDefault();
    try {
      await loginSendBird();
      await graph_login({ variables: { username, password } });
    } catch (error: any) {
      toast.error(<ErrorMessage message={`Check entered information and try again.`} />, { autoClose: 2000 });
    }
  }

  useEffect(() => {
    history.replace('/')

    if (localStorage.getItem('furtory-vet-token')) {
      history.replace('/dashboard');
    }
    // if (authArgs.app_id) login();
  }, [])

  // useEffect(() => {
  //   if (result.data) {
  //     const token = result.data.login.value
  //     setToken(token)
  //     localStorage.setItem('furtory-vet-token', token)
  //   }
  // }, [result.data]) // eslint-disable-line

  return (
    <FormContainer>
      <InputLabel htmlFor="usernameInput">Username</InputLabel>
      {usernameInput}
      <InputLabel htmlFor="passwordInput">Password</InputLabel>
      {passwordInput}
      <LoginButton
        primary
        size="mid"
        onClick={login}
      >
        Sign in
      </LoginButton>
    </FormContainer>
  );
};

export default LoginForm;
