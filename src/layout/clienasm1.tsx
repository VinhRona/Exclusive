import React from 'react'
import { Outlet } from 'react-router-dom'
import HeaderAsm from '../components/client/headerasm'
import FooterAsm from '../components/client/footerasm'

const ClientAsm = () => {
  return (
    <>
        <HeaderAsm/>
        <Outlet/>
        <FooterAsm/>
    </>
  )
}

export default ClientAsm