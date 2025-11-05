import Card from '@/Components/Card'
import React from 'react'

function CardWinners({ }) {
    return (
        <Card
            className={'bg-[#b41d1d] image-full w-72 h-96 shadow-xl'}
            style={{
                backgroundImage: `url('https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <Card.Body>
                <Card.Title>Winners</Card.Title>
                <p className='text-white'>Discover the champions who have set new standards of excellence and innovation across various fields. Celebrate their remarkable achievements and inspiring journeys.</p>
                <Card.Actions>
                    {/* Add any actions like buttons or links here if needed */}
                </Card.Actions>
            </Card.Body>

        </Card>
    )
}

export default CardWinners