import { ChakraProvider, theme } from '@chakra-ui/react'

const GlobalStyle = () => {
    return (
        <style global jsx>{`
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Open Sans', sans-serif;
            }

            /* App fit Height */ 
            html, body, #__next {
                min-height: 100vh;
                display: flex;
                flex: 1;
            }
            #__next {
                flex: 1;
            }
            #__next > * {
                flex: 1;
            }
            /* ./App fit Height */ 
        `}</style>
    )
}

const App = ({ Component, pageProps}) => {
    return (
    <>
        <GlobalStyle />
        <ChakraProvider>
            <Component {...pageProps}/>
        </ChakraProvider>
    </>
    )
}

export default App;