import React, { useMemo, useRef } from "react";
import { Carousel, Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const FeaturedBanner = ({ items = [], height = 320 }) => {
  const ref = useRef(null);

  const data = useMemo(() => {
    return (items || []).filter(Boolean);
  }, [items]);

  if (!data.length) return null;

  return (
    <div className="fb-wrap">
      <style>{`
        .fb-wrap{
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          background: #0b1220;
          box-shadow: 0 16px 40px rgba(0,0,0,.12);
        }

        /* ===== MŨI TÊN ===== */
        .fb-arrow{
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;               /* 👈 QUAN TRỌNG: đủ cao để thấy */
          width: 44px;
          height: 44px;
          border-radius: 999px;
          border: none;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          display: grid;
          place-items: center;
          cursor: pointer;

          opacity: 0;               /* ẨN MẶC ĐỊNH */
          pointer-events: none;
          transition: opacity .25s ease, background .25s ease;
        }

        /* Hover banner → hiện mũi tên */
        .fb-wrap:hover .fb-arrow{
          opacity: 1;
          pointer-events: auto;
        }

        .fb-arrow:hover{
          background: rgba(255,255,255,0.22);
        }

        .fb-arrow svg{
          color: rgba(255,255,255,0.75);
          font-size: 18px;
        }

        .fb-arrow.left{ left: 14px; }
        .fb-arrow.right{ right: 14px; }

        /* ===== SLIDE ===== */
        .fb-slide{
          height: ${height}px;
          padding: 26px 34px;
          position: relative;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          align-items: center;
          gap: 18px;
          z-index: 0;
        }

        .fb-glow{
          position: absolute;
          left: 26px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 120px;
          font-weight: 900;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.04);
          text-transform: uppercase;
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          z-index: 1;
        }

        /* ===== CHỮ LUÔN NỔI ===== */
        .fb-content{
          position: relative;
          z-index: 5;               /* 👈 CAO NHẤT */
        }

        .fb-subtitle{
          color: rgba(255,255,255,0.78);
          font-size: 14px;
          margin-bottom: 8px;
        }

        .fb-title{
          color: #fff;
          font-size: 42px;
          font-weight: 900;
          line-height: 1.05;
          text-shadow: 0 10px 40px rgba(0,0,0,0.35);
          max-width: 560px;
        }

        .fb-cta{ margin-top: 18px; }

        .fb-btn{
          border-radius: 999px !important;
          height: 44px !important;
          padding: 0 22px !important;
          font-weight: 900 !important;
          border: 1px solid rgba(255,255,255,0.35) !important;
          background: rgba(0,0,0,0.35) !important;
          color: #fff !important;
          backdrop-filter: blur(6px);
        }

        .fb-img{
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: flex-end;
        }

        .fb-img img{
          max-height: ${height - 40}px;
          max-width: 100%;
          object-fit: contain;
          filter: drop-shadow(0 18px 50px rgba(0,0,0,0.55));
        }

        @media (max-width: 900px){
          .fb-slide{
            grid-template-columns: 1fr;
            height: auto;
            padding: 22px 18px;
          }
          .fb-glow{
            font-size: 80px;
            left: 18px;
          }
          .fb-title{
            font-size: 32px;
          }
          .fb-img{
            justify-content: center;
            margin-top: 10px;
          }
          .fb-img img{
            max-height: 220px;
          }
        }
      `}</style>

      {/* arrows */}
      <button
        className="fb-arrow left"
        onClick={() => ref.current?.prev()}
        aria-label="Prev"
      >
        <LeftOutlined />
      </button>
      <button
        className="fb-arrow right"
        onClick={() => ref.current?.next()}
        aria-label="Next"
      >
        <RightOutlined />
      </button>

      <Carousel ref={ref} autoplay dots>
        {data.map((x) => (
          <div key={x.id}>
            <div
              className="fb-slide"
              style={{
                background:
                  x.bgColor ||
                  "radial-gradient(circle at 30% 40%, #1d4ed8 0%, #0b1220 45%, #000 100%)",
              }}
            >
              {x.glowText ? <div className="fb-glow">{x.glowText}</div> : null}

              <div className="fb-content">
                {x.subtitle ? (
                  <div className="fb-subtitle">{x.subtitle}</div>
                ) : null}

                <div className="fb-title">{x.title}</div>

                <div className="fb-cta">
                  <Link to={x.href || "/products"} style={{ textDecoration: "none" }}>
                    <Button className="fb-btn" size="large">
                      {x.ctaText || "XEM NGAY"} <span style={{ marginLeft: 8 }}>›</span>
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="fb-img">
                {x.imageUrl ? (
                  <img src={x.imageUrl} alt={x.title} />
                ) : (
                  <div />
                )}
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default FeaturedBanner;
