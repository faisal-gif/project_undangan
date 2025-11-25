import NewsCardAuto from '@/Components/NewsCardAuto'
import React from 'react'

function ListNews({ news }) {
    return (

        <section className=" pb-32 px-6 relative ">
          
            <div className="absolute inset-0 bg-pattern-dots" />

         

            <div className="max-w-6xl  mx-auto relative z-10">
                {news.length > 0 && (
                    <div className="mb-12 space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 lg:grid-cols-3">
                        {news.map((news, index) => (
                            <NewsCardAuto
                                key={news.news_id}
                                title={news.news_title}
                                description={news.news_description}
                                writer={news.news_writer}
                                datePub={news.news_datepub}
                                image={news.news_image_new}
                                views={Number(news.pageviews)}
                                url={news.url_ci4}
                                category={news.cat_title}
                                priority={index === 0}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>

    )
}

export default ListNews