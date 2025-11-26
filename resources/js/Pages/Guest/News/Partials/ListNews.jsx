import NewsCardAuto from '@/Components/NewsCardAuto'
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import React from 'react'

function ListNews({ news }) {

    const { page, limit } = usePage().props;


    const hasNext = news.length === limit;
    const hasPrev = page > 1;




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


                <div className='w-52 mx-auto'>
                    {/* Pagination */}
                    <div className="join grid grid-cols-2">
                        {/* Prev */}
                        {hasPrev ? (
                            <Link href={`?page=${Number(page) - 1}`} className="join-item btn btn-outline rounded-sm bg-amber-400/80 hover:bg-amber-400/20 text-white border-amber-600/40 hover:border-amber-500">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                            </Link>
                        ) : (
                            <button className="join-item btn rounded-sm bg-slate-700/50 border-slate-600 text-slate-400 cursor-not-allowed">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                            </button>
                        )}

                        {/* Next */}
                        {hasNext ? (
                            <Link href={`?page=${Number(page) + 1}`} className="join-item btn rounded-sm  bg-amber-400/80 hover:bg-amber-400/20 text-white border-amber-600/40 hover:border-amber-500">
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        ) : (
                            <button className="join-item btn rounded-sm  bg-slate-700/50 border-slate-600 text-slate-400 cursor-not-allowed">
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>


            </div>




        </section>

    )
}

export default ListNews