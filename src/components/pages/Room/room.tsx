import Overlay from "components/atoms/Overlay";
import { ErrorMessage } from "components/atoms/Toast";
import GroupCall from "components/organisms/GroupCall";
import Header from "components/organisms/Header";
import Preview from "components/organisms/Preview";
import RoomCreated from "components/organisms/RoomCreated";
import { AuthOption, useSbCalls } from "lib/sendbird-calls";
import { useState, useEffect, useMemo, useCallback } from "react";
import { FullScreen, FullScreenContent } from "components/templates/Screen";
import * as fonts from 'styles/fonts';
import styled from "styled-components";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "components/atoms/Button";
import Icon from "components/atoms/Icon";
import storage from 'lib/storage';

const Wrapper = styled(FullScreen)`
`;

const Content = styled(FullScreenContent)`
  width: 688px;
`

const Title = styled.div`
  ${fonts.big};
  ${fonts.demi};
  margin-bottom: 16px;
`;

const Description = styled.div`
  ${fonts.normal};
  ${fonts.heavy};
  color: var(--navy-600);
  height: 20px;
  text-align: center;
  margin-bottom: 48px;
  letter-spacing: -0.1px;
`;

const Boxes = styled.div`
  display: flex;
`;

const FormBox = styled.div`
  width: 336px;
  height: 248px;
  padding: 32px;
  margin-right: 16px;
  &:last-child {
    margin-right: 0;
  }
  border-radius: 4px;
  border: solid 1px var(--navy-100);
  background-color: var(--white);
`;

const FormBoxIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-bottom: 16px;
`

const FormBoxTitle = styled.div`
  ${fonts.midBig};
  ${fonts.demi};
  color: var(--navy-900);
  margin-bottom: 8px;
`;

const FormBoxDescription = styled.div`
  ${fonts.normal};
  color: var(--navy-900);
  margin-bottom: 32px;
`

const FormButton = styled(Button)`
  ${fonts.normal};
  ${fonts.demi};
  color: var(--white);
  width: 100%;
`

const TextButton = styled.div<{ disabled: boolean; }>`
  ${fonts.normal};
  ${fonts.demi};
  color: var(--purple-300);
  height: 20px;
  text-align: center;
  cursor: pointer;
  margin-left: 16px;
  ${props => props.disabled ? 'color: var(--navy-300);' : ''};
`

const Room = () => {
    const sbCalls = useSbCalls();
    // const query = new URLSearchParams(useLocation().search);
    // const roomIdQuery = query.get('room_id');
    const history = useHistory();

    const { rooms } = sbCalls;
    const { id: roomId } = useParams<{ id: string }>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showRoomCreated, setShowRoomCreated] = useState(false);

    useEffect(() => {
        if (!storage.getItem('furtory-vet-token')) {
            history.replace('/');
        }

        let data: any = localStorage.getItem('sbCalls');
        if (data) {
            data = JSON.parse(data);
        };

        console.log('sbCalls authenticated? ', sbCalls.isAuthenticated);

        const APP_ID: any = process.env.REACT_APP_APP_ID;
        sbCalls.init(APP_ID);
        if (!sbCalls.isAuthenticated) {
            const option: AuthOption = { userId: data.userId };
            sbCalls.auth(option);
        }

        if (roomId) {
            enter(roomId, false);
        }
    }, [])


    useEffect(() => {
        const room = rooms[rooms.length - 1];
    }, [rooms]);

    const onCall = useMemo(() => {
        return rooms.find(r => !!r.localParticipant);
    }, [rooms]);

    const enter = useCallback(async (roomId: string, skipDialog: boolean) => {
        if (!sbCalls.isAuthenticated) {
            let data: any = localStorage.getItem('sbCalls');
            if (data) {
                data = JSON.parse(data);
            };
            // const APP_ID: any = process.env.REACT_APP_APP_ID;
            // sbCalls.init(APP_ID);
            const option: AuthOption = { userId: data.userId };
            await sbCalls.auth(option);
        }

        try {
            const room = await sbCalls.fetchRoomById(roomId);

            console.log("room", room);

            if (skipDialog) {
                room.enter({
                    audioEnabled: true,
                    videoEnabled: true,
                }).catch(error => {
                    console.error(error);
                    history.replace('/dashboard');
                    // toast.error(<ErrorMessage message={error.message} />, { autoClose: 2000 });
                })
            } else {
                setIsModalOpen(true);
            }
        } catch (e: any) {
            console.error(e);
            history.replace('/dashboard');
        }
    }, [sbCalls])

    // console.log(rooms);
    console.log(JSON.stringify(rooms[rooms.length - 1], null, 4));
    // console.log({ onCall });

    return (
        <Wrapper>
            {/* <Header /> */}
            <Content>
                <Preview
                    isOpen={isModalOpen}
                    room={rooms[rooms.length - 1]}
                    close={() => {
                        setIsModalOpen(false);
                    }}
                    contentLabel="Preview"
                />
                {onCall &&
                    <Overlay>
                        <GroupCall room={onCall} />
                        {/* <RoomCreated
                            isOpen={showRoomCreated}
                            room={onCall}
                            close={() => setShowRoomCreated(false)}
                        /> */}
                    </Overlay>
                }
            </Content>
        </Wrapper>
    )
}

export default Room;