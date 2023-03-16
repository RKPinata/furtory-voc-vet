import ChoicesTemp from '../../templates/Choices';
import styled from 'styled-components';
import * as mixins from 'styles/mixins';
import Button from 'components/atoms/Button';
import { Link } from 'react-router-dom';
import LoginPage from '../LoginPage';
import LoginForm from 'components/organisms/LoginForm';
import { useState } from 'react';

const Wrapper = styled.div`
  ${mixins.fullScreen};
  ${mixins.bgWhite};
  ${mixins.flexColumn};
  align-items: center;
  padding: 33px;
`;

const Logo = styled.img`
  display: block;
  width: 122px;
  height: 27px;
`;

const Heading = styled.h2`
  display: block;
  padding: 33px;
`;

const LandingPage = () => {
  return (
    <Wrapper>
      <Heading>
        Furtory
      </Heading>
      <LoginForm />
    </Wrapper>
  );
}

export default LandingPage;
