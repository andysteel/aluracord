import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import { useState, useEffect } from 'react';
import appConfig from '../../config.json';
import { createClient } from '@supabase/supabase-js';
import { Spinner } from '@chakra-ui/spinner';
import { useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ButtonSendSticker } from '../components/ButtonSendSticker';

export default function ChatPage(props) {
    const [mensagem, setMensagem] = useState('');
    const [listaDeMensagens, setListaDeMensagens] = useState([]);
    const roteamento = useRouter();
    const [usuarioLogado, setUsuarioLogado] = useState(roteamento.query.username);
    const toast = useToast();
    const supabaseClient = createClient(props.SUPABASE_URL, props.SUPABASE_ANON_KEY)

    const escutaMensagemEmTempoReal = (adicionaMensagem) => {
        return supabaseClient
            .from('mensagens')
            .on('INSERT', (data) => {
                adicionaMensagem(data.new)
            })
            .subscribe()
    }

    useEffect(() => {

        supabaseClient
            .from('mensagens')
            .select('*')
            .order('id', {ascending: false})
            .then(({data}) => {
                setListaDeMensagens(data)
            })
        const subscription = escutaMensagemEmTempoReal((novaMensagem) => {
            toast({
                title: 'Nova mensagem',
                description: `de: ${novaMensagem.de}`,
                status: 'success',
                duration: 3000,
                position: 'top-right',
                isClosable: true,
            })
                setListaDeMensagens((valorAtualDaLista) => {
                    return [
                        novaMensagem,
                        ...valorAtualDaLista
                    ]
                });
        })

        return () => {
            subscription.unsubscribe();
        }
    }, [])

    function handleNovaMensagem(novaMensagem) {
        if(!usuarioLogado) {
            roteamento.push("/");
            return;
        }
        const mensagem = {
            de: usuarioLogado,
            texto: novaMensagem,
        };

        supabaseClient
            .from('mensagens')
            .insert([mensagem])
            .then(({ data }) => {
                console.log(data)
            });
        setMensagem('');
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary['500'],
                backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals['700'],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals['600'],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >
                    <MessageList mensagens={listaDeMensagens} />
                    {listaDeMensagens.length === 0 &&
                        <Box
                            as="div"
                            styleSheet={{
                                display: 'flex',
                                justifyContent: 'center',
                                margin: '10rem 0 15rem 0'
                            }}
                        >
                            <Spinner thickness='6px' speed='0.65s' emptyColor='gray.200' color='green.500' size='xl'/>
                        </Box> 
                    } 

                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={mensagem}
                            onChange={(event) => {
                                setMensagem(event.target.value);
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleNovaMensagem(mensagem);
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals['800'],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals['200'],
                            }}
                        />
                        <ButtonSendSticker onStickerClick={(sticker) => {
                            handleNovaMensagem(`:sticker:${sticker}`)
                        }} />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export async function getServerSideProps(context) {
    return {
      props: {
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        SUPABASE_URL: process.env.SUPABASE_URL
      },
    }
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {

    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((mensagem) => {
                return (
                    <Text
                        key={mensagem.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals['700'],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                }}
                                src={`https://github.com/${mensagem.de}.png`}
                            />
                            <Text tag="strong">
                                {mensagem.de}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals['300'],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                        </Box>
                        {mensagem.texto.startsWith(':sticker:')
                        ? (
                            <Image 
                                styleSheet={{
                                    width: '20%'
                                }}
                                src={mensagem.texto.replace(':sticker:','')} 
                            />
                        )
                        : (mensagem.texto)
                        }
                    </Text>
                );
            })}
        </Box>
    )
}