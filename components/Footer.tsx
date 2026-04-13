import Link from 'next/link'
import React from 'react'

const Footer = () => {
    return (
        <div>
            <Link href={'/privacy-policy'} className='text-underline'>
                Privacy Policy
            </Link>
        </div>
    )
}

export default Footer