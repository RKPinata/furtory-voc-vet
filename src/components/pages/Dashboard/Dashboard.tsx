import { gql, useMutation, useQuery, useSubscription } from '@apollo/client';
import Button from 'components/atoms/Button';
import { useSbCalls } from 'lib/sendbird-calls';
import { GET_ROOMS, ME } from 'graphql/queries';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { BsToggleOn, BsToggleOff } from 'react-icons/bs';
import * as fonts from 'styles/fonts';
import { colors } from 'utils/variables';
import * as mixins from 'styles/mixins';
import { media, mediaMax } from 'utils';
import Menu from 'components/organisms/Menu';
import { RxButton, RxHamburgerMenu } from 'react-icons/rx';
import { EDIT_VET } from 'graphql/mutations';

const GenericButton = styled(Button)`
  ${fonts.normal};
  ${fonts.demi};
  color: var(--white);
  width: 100px;
  margin-bottom: 40px;
  margin-left: 20px;
`;

const Title = styled.div`
  ${fonts.big};
  ${fonts.demi};
  margin-bottom: 16px;
  padding-top: 10px;
  padding-bottom: 40px;
`;

const SubHeading = styled.div`
  ${fonts.big};
  margin-bottom: 40px;
`;

const Wrapper = styled.div`
  ${mixins.fullScreen};
  ${mixins.bgWhite};
  ${mixins.flexColumn};
  align-items: center;
  padding: 20px 40px 20px 40px;
`;

const Nav = styled.div`
    width: 100%;
    ${mixins.flexRow};
    justify-content: space-between;
    padding-bottom: 40px;

    ${mediaMax.tablet} {
        display: none;
    }
`;

const TableWrapper = styled.div`
    width: 100%;
    overflow-x:auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    background-color: ${colors.purple300};
    color: white;
    text-align: left;
    padding: 8px;
  }

  td {
      color: ${colors.darkgray};
      padding: 8px;
  }
  
  tr:nth-child(even) {
      background-color: #f2f2f2;
  }
`

const Items = styled.div`
  width: 100%;
  display: inline-flex;
  position: relative;
  align-items: center;
  padding-bottom: 20px;

  ${media.tablet} {
    display: none;
  }
`;

const UserDiv = styled.div`
  display: flex;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 4px 8px;

  ${media.main} {
    flex-direction: row-reverse;
    &:hover {
      cursor: pointer;
    }
  }
`;

const MenuDivider = styled.div`
  width: 100%;
  height: 1px;
  margin: 8px 0;
  background-color: var(--navy-100);
`;

const CLIENTS_WITH_ROOMS_SUBSCRIPTION = gql`
subscription ClientsWithRooms {
  clientsWithRooms {
    roomId
    roomCreatedAt
    id
    description
    assignedVet
  }
}
`

const Dashboard = () => {
    const sbCalls = useSbCalls();
    const history = useHistory();

    // const [isOnline, setIsOnline] = useState(true);
    const [clientsWithRooms, setClientsWithRooms] = useState<any>();

    const { data: vetData, loading: vetDataLoading, error: meError } = useQuery(ME, {
        // onError: (error) => {
        //     console.log(error);
        // },
        onCompleted: (data) => {
            console.log(data);
        },
    })

    const { loading: roomsloading, data: initialRoomData, error: roomQueryError } = useQuery(GET_ROOMS, {
        fetchPolicy: 'no-cache'
    });

    const [editVet, result] = useMutation(EDIT_VET, {
        onError: (error) => {
            console.log(error);
        },
        update: (cache, response) => {
            console.log(response.data);
            cache.updateQuery({ query: ME }, ({ me }) => {
                return {
                    me: { ...me, available: response.data.editVet.available },
                }
            })
        },
    });

    useEffect(() => {
        if (!localStorage.getItem('furtory-vet-token')) {
            history.replace('/');
        }

        if (!sbCalls.isAuthenticated) {
            const APP_ID: any = process.env.REACT_APP_APP_ID;
            sbCalls.init(APP_ID);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!roomsloading && initialRoomData) {
            setClientsWithRooms(initialRoomData.clientsWithRooms);
        }
    }, [roomsloading, initialRoomData]);

    useSubscription(CLIENTS_WITH_ROOMS_SUBSCRIPTION, {
        shouldResubscribe: true,
        onData: ({ data }) => {
            console.log(data.data.clientsWithRooms);
            setClientsWithRooms(data.data.clientsWithRooms);
        },
        onError: (error) => {
            console.log(error);
        },
        fetchPolicy: 'no-cache'
    });

    const logOut = () => {
        if (sbCalls.isAuthenticated) {
            sbCalls.deauth();
        }
        localStorage.removeItem('furtory-vet-token');
        history.replace('/');
    }

    const changeAvailabity = async () => {
        await editVet({ variables: { editVetId: vetData?.me?.id, available: !vetData?.me?.available } })
    }

    if (meError || roomQueryError) {
        history.replace('/login');
    }

    if (roomsloading || vetDataLoading) {
        return (
            <p>Loading</p>
        )
    }

    return (
        <Wrapper>
            <Nav>
                <Title className=''>Dashboard</Title>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row'
                }}>
                    <div style={{ marginRight: '10px', paddingTop: '10px' }}>Status: {vetData?.me?.available ? 'Online' : 'Off Duty'}</div>
                    <BsToggleOn display={vetData?.me?.available ? '' : 'none'} size={36} onClick={changeAvailabity} color={colors.green300} />
                    <BsToggleOff display={!vetData?.me?.available ? '' : 'none'} size={36} onClick={changeAvailabity} color={'grey'} />
                    <GenericButton
                        primary
                        size='mid'
                        onClick={logOut}>
                        Logout
                    </GenericButton>
                </div>
            </Nav>
            <Items>
                <Menu
                    items={[
                        {
                            label: 'Sign out',
                            handleClick: logOut,
                        },
                        {
                            label: `Status: ${vetData?.me?.available ? 'Online 🟢' : 'Off Duty 🌙'}`,
                            handleClick: changeAvailabity,
                        },
                    ]}
                    Dropdown={
                        props => (
                            <UserDiv {...props}>
                                <RxHamburgerMenu size={36} />
                            </UserDiv>
                        )
                    }
                    Divider={MenuDivider}
                />
            </Items>
            <SubHeading style={{
                display: vetData?.me?.available ? '' : 'none'
            }}>Created rooms will appear here</SubHeading>
            <SubHeading style={{
                display: !vetData?.me?.available ? '' : 'none'
            }}>You are off duty. Toggle the button to go online</SubHeading>

            {vetData?.me?.available && clientsWithRooms?.map(({ id, roomId, description, roomCreatedAt }: any) => (
                // roomId &&
                <div key={id}>
                    <p>
                        {id?.trim()}
                    </p>
                    <p>
                        {roomId?.trim()}
                    </p>
                    <p>
                        {description ? description : '-----'}
                    </p>
                    <p>
                        <p onClick={() => history.replace(`/room/${roomId}`)}>
                            Click to join
                        </p>
                    </p>
                    {roomCreatedAt && <CreatedAt creationTime={roomCreatedAt} />}
                </div>
            ))
            }
            {/* <TableWrapper>
                <Table style={{
                    display: vetData?.me?.available ? '' : 'none'
                }}>
                    <thead>
                        <tr>
                            <th>User Id</th>
                            <th>Room Id</th>
                            <th>Description</th>
                            <th>Join Link</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vetData?.me?.available && clientsWithRooms?.map(({ id, roomId, description, roomCreatedAt }: any) => (
                            // roomId &&
                            <tr key={id}>
                                <td>
                                    {id?.trim()}
                                </td>
                                <td>
                                    {roomId?.trim()}
                                </td>
                                <td>
                                    {description ? description : '-----'}
                                </td>
                                <td>
                                    <p onClick={() => history.replace(`/room/${roomId}`)}>
                                        Click to join
                                    </p>
                                </td>
                                {roomCreatedAt && <CreatedAt creationTime={roomCreatedAt} />}
                            </tr>
                        ))
                        }
                    </tbody>
                </Table>
            </TableWrapper> */}
        </Wrapper>
    )
}

interface CreatedAtProps {
    creationTime: string;
}
const CreatedAt = ({ creationTime }: CreatedAtProps) => {
    const [minutes, setMinutes] = useState(Math.floor((Date.now() - Number(creationTime)) / 60000));

    useEffect(() => {
        const interval = setInterval(() => {
            const current = Date.now();
            const diff = current - Number(creationTime);
            const diffInMinutes = Math.floor(diff / 60000);

            setMinutes(diffInMinutes);
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <td>
            {minutes <= 1 ? 'Just Now' : `${minutes} minutes ago`}
        </td>
    )
}

export default Dashboard;