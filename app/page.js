'use client';

import { useEffect, useMemo, useState } from 'react';

// Notion-friendly: each property is a plain value that can map directly to a Notion property.
// Example mappings: title -> Title, date -> Date, actors -> Multi-select, price -> Number.
const sampleData = [
  {
    id: 'show-001',
    title: '레베카',
    date: '2026-10-24',
    time: '19:00',
    venue: '블루스퀘어 신한카드홀',
    seat: '1층 B구역 8열 12번',
    actors: ['이지혜', '류정한', '테이', '김보경'],
    price: 150000,
    booking: '인터파크 티켓',
    discount: '조기예매 10%',
    event: '커튼콜 데이',
    memo: '서늘한 분위기와 압도적인 무대가 정말 좋았다. 2막의 넘버는 오래 기억에 남을 것 같다.',
  },
  {
    id: 'show-002',
    title: '프랑켄슈타인',
    date: '2026-09-12',
    time: '14:00',
    venue: '블루스퀘어 신한카드홀',
    seat: '2층 A구역 2열 5번',
    actors: ['전동석', '박은태', '이정수', '김지우'],
    price: 130000,
    booking: '멜론티켓',
    discount: '청소년 동반 할인',
    event: '프로그램북 증정',
    memo: '두 배우의 감정선이 팽팽하게 맞붙었다. 넘버와 조명이 만드는 장면 전환도 인상적.',
  },
  {
    id: 'show-003',
    title: '하데스타운',
    date: '2026-08-03',
    time: '19:30',
    venue: '샤롯데씨어터',
    seat: '1층 C구역 10열 3번',
    actors: ['박강현', '김환희', '강홍석', '최재림'],
    price: 140000,
    booking: '예스24 티켓',
    discount: '카드사 할인 5%',
    event: '없음',
    memo: '재즈풍 음악과 원형 무대의 몰입감. 마지막 장면에서 객석 전체가 숨을 죽였다.',
  },
  {
    id: 'show-004',
    title: '레베카',
    date: '2026-06-21',
    time: '14:00',
    venue: '충무아트센터 대극장',
    seat: '1층 A구역 6열 18번',
    actors: ['이지혜', '민영기', '테이', '김보경'],
    price: 150000,
    booking: '인터파크 티켓',
    discount: '재관람 할인 15%',
    event: '무대인사',
    memo: '같은 작품도 캐스팅에 따라 결이 달라서 즐겁다. 이번 막심은 따뜻하고 섬세했다.',
  },
  {
    id: 'show-005',
    title: '웃는 남자',
    date: '2026-04-05',
    time: '18:30',
    venue: '예술의전당 오페라극장',
    seat: '1층 D구역 12열 7번',
    actors: ['박효신', '박은태', '양준모', '민경아'],
    price: 160000,
    booking: '예스24 티켓',
    discount: '얼리버드 10%',
    event: '없음',
    memo: '웅장한 세트와 서커스 장면이 아름다웠다. 극이 끝난 뒤에도 여운이 깊게 남았다.',
  },
  {
    id: 'show-006',
    title: '하데스타운',
    date: '2026-02-14',
    time: '19:30',
    venue: '샤롯데씨어터',
    seat: '1층 B구역 5열 9번',
    actors: ['조형균', '김수하', '강홍석', '최재림'],
    price: 145000,
    booking: '인터파크 티켓',
    discount: '없음',
    event: '밸런타인데이 스페셜 MD',
    memo: '라이브 밴드의 에너지가 객석까지 전해졌다. 다음 시즌에도 꼭 다시 보고 싶은 작품.',
  },
];

const money = (amount) => `${Number(amount || 0).toLocaleString('ko-KR')}원`;
const dateLabel = (value) => {
  if (!value) return '날짜 미정';
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(date);
};

function Icon({ name, size = 20 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    ticket: <><path d="M3 8a2 2 0 0 0 0 4v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 1 0-4V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><path d="M13 5v2m0 4v2m0 4v2"/></>,
    coin: <><circle cx="12" cy="12" r="9"/><path d="M15 8.5c-.6-.7-1.6-1-2.8-1-1.5 0-2.7.8-2.7 2s1.2 1.8 2.7 2.1 2.8.8 2.8 2.1-1.2 2.3-2.9 2.3c-1.2 0-2.3-.4-3-1.2M12 5.5v13"/></>,
    chart: <><path d="M4 19V5m0 14h17"/><path d="m7 15 4-4 3 2 5-6"/></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    heart: <path d="M20.8 8.8c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z"/>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export default function Home() {
  const [records, setRecords] = useState([]);
  const [modal, setModal] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Swap this local loader for a Notion/API request later; keep normalized properties above.
  useEffect(() => {
    setRecords(sampleData);
  }, []);

  const sortedRecords = useMemo(() => [...records].sort((a, b) => b.date.localeCompare(a.date)), [records]);
  const totalSpend = useMemo(() => records.reduce((sum, item) => sum + Number(item.price || 0), 0), [records]);
  const actorRanking = useMemo(() => {
    const counts = {};
    records.forEach((record) => (record.actors || []).forEach((actor) => { counts[actor] = (counts[actor] || 0) + 1; }));
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ko'));
  }, [records]);
  const showRanking = useMemo(() => {
    const counts = {};
    records.forEach(({ title }) => { counts[title] = (counts[title] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ko'));
  }, [records]);
  const average = records.length ? Math.round(totalSpend / records.length) : 0;

  useEffect(() => {
    if (!modal) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') { setModal(null); setSelectedRecord(null); } };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKeyDown); document.body.style.overflow = ''; };
  }, [modal]);

  const openDetail = (record) => { setSelectedRecord(record); setModal('detail'); };
  const closeModal = () => { setModal(null); setSelectedRecord(null); };

  const RankingCard = ({ title, subtitle, icon, items, limit, type }) => (
    <section className="panel ranking-panel">
      <div className="panel-heading">
        <div className="heading-icon"><Icon name={icon} size={19} /></div>
        <div className="heading-copy"><h2>{title}</h2><p>{subtitle}</p></div>
        <button className="text-button" onClick={() => setModal(type)} aria-label={`${title} 전체 순위 보기`}>전체보기 <span>➔</span></button>
      </div>
      <div className="ranking-list">
        {items.slice(0, limit).map((item, index) => {
          const max = items[0]?.count || 1;
          return <div className="rank-row" key={item.name}>
            <span className={`rank-number ${index < 3 ? 'top-rank' : ''}`}>{String(index + 1).padStart(2, '0')}</span>
            <span className="rank-name">{item.name}</span>
            <div className="bar-track"><span className="bar-fill" style={{ width: `${Math.max(8, (item.count / max) * 100)}%` }} /></div>
            <span className="rank-count">{item.count}<small>회</small></span>
          </div>;
        })}
        {!items.length && <p className="empty-inline">아직 기록이 없습니다.</p>}
      </div>
    </section>
  );

  return (
    <main className="page-shell">
      <div className="container">
        <header className="topbar">
          <a className="brand" href="#home" aria-label="막간 홈"><span className="brand-mark">막</span><span className="brand-name">막간<span className="brand-dot">.</span></span></a>
          <div className="topbar-note"><span className="note-line" /> 나의 뮤지컬 아카이브</div>
          <div className="profile-chip"><span className="profile-avatar">M</span><span>My theater log</span></div>
        </header>

        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-star">✳</span> MY MUSICAL JOURNAL</p>
            <h1>무대가 끝난 뒤에도,<br /><em>이야기는 계속됩니다.</em></h1>
            <p className="hero-description">객석에서 만난 순간과 마음을 차곡차곡 기록해요.</p>
          </div>
          <div className="hero-decoration" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><span className="deco-star">✳</span><span className="deco-note">♪</span></div>
          <div className="hero-caption"><span>CURTAIN UP</span><span className="caption-divider"/><span>MEMORIES ON</span></div>
        </section>

        <section className="stats-grid" aria-label="관극 통계">
          <article className="stat-card"><span className="stat-icon"><Icon name="ticket" size={19} /></span><span className="stat-label">총 관극 횟수</span><strong>{records.length}<small>회</small></strong><span className="stat-foot">무대 위의 소중한 순간</span></article>
          <article className="stat-card"><span className="stat-icon"><Icon name="coin" size={19} /></span><span className="stat-label">총 지출 금액</span><strong className="stat-money">{money(totalSpend)}</strong><span className="stat-foot">티켓으로 채운 추억의 값</span></article>
          <article className="stat-card"><span className="stat-icon"><Icon name="chart" size={19} /></span><span className="stat-label">회당 평균 지출</span><strong className="stat-money">{money(average)}</strong><span className="stat-foot">한 번의 관극을 위한 평균</span></article>
          <span className="stat-sparkle" aria-hidden="true">✦</span>
        </section>

        <div className="section-title-row">
          <div><p className="eyebrow dark-eyebrow">YOUR FAVORITES</p><h2 className="section-title">나의 관극 랭킹</h2></div>
          <span className="section-aside">무대에서 다시 만나고 싶은 이름들</span>
        </div>
        <section className="ranking-grid">
          <RankingCard title="최다 관람 배우" subtitle="함께한 무대가 많은 배우" icon="star" items={actorRanking} limit={5} type="actors" />
          <RankingCard title="최다 관람 작품" subtitle="다시 찾게 되는 이야기" icon="heart" items={showRanking} limit={3} type="shows" />
        </section>

        <section className="records-section">
          <div className="section-title-row records-heading">
            <div><p className="eyebrow dark-eyebrow">MEMORY ARCHIVE</p><h2 className="section-title">관극 기록 <span className="record-count">{records.length}</span></h2></div>
            <span className="sort-label"><Icon name="calendar" size={16} /> 최신 관극순</span>
          </div>
          <div className="record-list">
            {sortedRecords.map((record, index) => (
              <button className="record-card" key={record.id} onClick={() => openDetail(record)}>
                <span className="record-date"><span>{new Date(`${record.date}T00:00:00`).getFullYear()}</span><strong>{new Date(`${record.date}T00:00:00`).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace('.', '').replace('.', '')}</strong></span>
                <span className="record-main"><span className="record-kicker">MUSICAL No. {String(sortedRecords.length - index).padStart(2, '0')}</span><strong className="record-title">{record.title}</strong><span className="record-cast">{(record.actors || []).slice(0, 3).join(' · ')}{record.actors?.length > 3 ? ' 외' : ''}</span></span>
                <span className="record-venue"><Icon name="pin" size={16} />{record.venue}</span>
                <span className="record-price">{money(record.price)}</span>
                <span className="record-arrow"><Icon name="arrow" size={18} /></span>
              </button>
            ))}
            {!sortedRecords.length && <div className="empty-state">첫 번째 관극의 설렘을 기록해보세요.</div>}
          </div>
        </section>

        <footer className="footer"><a className="brand footer-brand" href="#home"><span className="brand-mark">막</span><span className="brand-name">막간<span className="brand-dot">.</span></span></a><span>오늘의 커튼콜이 오래도록 기억되기를.</span><span className="footer-year">EST. 2026</span></footer>
      </div>

      {modal && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
        <section className={`modal ${modal === 'detail' ? 'detail-modal' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button className="modal-close" onClick={closeModal} aria-label="닫기"><Icon name="close" size={20} /></button>
          {modal === 'detail' && selectedRecord ? <>
            <p className="eyebrow dark-eyebrow">A NIGHT TO REMEMBER</p><h2 id="modal-title" className="modal-title">{selectedRecord.title}</h2>
            <p className="detail-date"><Icon name="calendar" size={16} /> {dateLabel(selectedRecord.date)} · {selectedRecord.time}</p>
            <div className="detail-divider" />
            <div className="detail-grid">
              <div className="detail-item"><span>캐스팅</span><strong>{(selectedRecord.actors || []).join(' · ') || '—'}</strong></div>
              <div className="detail-item"><span>극장</span><strong>{selectedRecord.venue || '—'}</strong></div>
              <div className="detail-item"><span>좌석</span><strong>{selectedRecord.seat || '—'}</strong></div>
              <div className="detail-item"><span>금액</span><strong>{money(selectedRecord.price)}</strong></div>
              <div className="detail-item"><span>예매처</span><strong>{selectedRecord.booking || '—'}</strong></div>
              <div className="detail-item"><span>할인</span><strong>{selectedRecord.discount || '없음'}</strong></div>
              <div className="detail-item full-width"><span>이벤트</span><strong>{selectedRecord.event || '없음'}</strong></div>
            </div>
            <div className="memo-box"><span>MEMORY NOTE</span><p>{selectedRecord.memo || '남겨둔 메모가 없습니다.'}</p></div>
            <button className="modal-done" onClick={closeModal}>기록으로 돌아가기</button>
          </> : <>
            <p className="eyebrow dark-eyebrow">YOUR PERSONAL RANKING</p>
            <h2 id="modal-title" className="modal-title">{modal === 'actors' ? '최다 관람 배우' : '최다 관람 작품'}</h2>
            <p className="modal-subtitle">{modal === 'actors' ? '함께한 모든 무대의 기록' : '다시 찾은 작품의 기록'}</p>
            <div className="full-ranking-list">
              {(modal === 'actors' ? actorRanking : showRanking).map((item, index, list) => <div className="full-rank-row" key={item.name}><span className={`full-rank-number ${index < 3 ? 'top-rank' : ''}`}>{String(index + 1).padStart(2, '0')}</span><span className="full-rank-name">{item.name}</span><div className="bar-track"><span className="bar-fill" style={{ width: `${Math.max(8, (item.count / (list[0]?.count || 1)) * 100)}%` }} /></div><strong>{item.count}<small>회</small></strong></div>)}
              {!(modal === 'actors' ? actorRanking : showRanking).length && <p className="empty-inline">아직 기록이 없습니다.</p>}
            </div>
            <button className="modal-done" onClick={closeModal}>닫기</button>
          </>}
        </section>
      </div>}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Noto+Serif+KR:wght@400;500;600;700&display=swap');
        :root{--paper:#fcfbf7;--ink:#302a28;--muted:#89817a;--wine:#78282b;--wine-dark:#572024;--gold:#b5935b;--line:#e9e4dc;--serif:'Noto Serif KR',serif;--sans:'DM Sans','Noto Sans KR',sans-serif}
        *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased}button,a{font:inherit}button{color:inherit}.page-shell{min-height:100vh;background:radial-gradient(ellipse at 93% 8%,rgba(181,147,91,.07),transparent 25%),var(--paper)}.container{width:min(1120px,calc(100% - 64px));margin:0 auto}.topbar{height:82px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(120,40,43,.12)}.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--wine)}.brand-mark{width:30px;height:30px;border:1px solid var(--gold);border-radius:50%;display:grid;place-items:center;font-family:var(--serif);font-size:15px}.brand-name{font-family:var(--serif);font-weight:600;font-size:20px;letter-spacing:-1px}.brand-dot{color:var(--gold)}.topbar-note{display:flex;align-items:center;gap:10px;color:#877d73;font-size:11px;letter-spacing:1.3px}.note-line{width:25px;height:1px;background:var(--gold)}.profile-chip{display:flex;align-items:center;gap:9px;color:#766e67;font-size:11px;letter-spacing:.3px}.profile-avatar{width:29px;height:29px;border-radius:50%;display:grid;place-items:center;color:var(--wine);background:#f0e9dd;font-family:var(--serif);font-size:13px}.hero{height:285px;position:relative;display:flex;align-items:center;overflow:hidden}.hero-copy{position:relative;z-index:1;padding-bottom:8px}.eyebrow{margin:0 0 17px;color:var(--gold);font-size:9px;font-weight:600;letter-spacing:2.6px}.eyebrow-star{font-size:13px;margin-right:7px}.hero h1{font-family:var(--serif);font-size:38px;line-height:1.55;letter-spacing:-1.5px;font-weight:500;margin:0;color:#332827}.hero h1 em{font-style:normal;color:var(--wine)}.hero-description{font-size:12px;color:#8c8179;margin:15px 0 0;letter-spacing:.15px}.hero-decoration{position:absolute;width:355px;height:250px;right:35px;top:17px;color:var(--gold);opacity:.8}.orbit{position:absolute;border:1px solid rgba(181,147,91,.38);border-radius:50%;transform:rotate(-30deg)}.orbit-one{width:290px;height:170px;right:4px;top:40px}.orbit-two{width:220px;height:240px;right:38px;top:2px;transform:rotate(42deg)}.deco-star{position:absolute;top:41px;right:54px;font-size:28px}.deco-note{position:absolute;right:200px;top:164px;font-family:var(--serif);font-size:48px;color:var(--wine);transform:rotate(-12deg)}.hero-caption{position:absolute;right:4px;bottom:26px;display:flex;align-items:center;gap:10px;color:#a49a8c;font-size:8px;letter-spacing:2px}.caption-divider{width:28px;height:1px;background:#d6c6a9}.stats-grid{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;border-radius:4px;overflow:hidden;background:rgba(255,255,255,.2);box-shadow:0 12px 30px rgba(67,28,29,.11);background-image:linear-gradient(112deg,#702326 0%,#8d3937 51%,#622326 100%);color:white}.stat-card{position:relative;min-height:148px;padding:22px 27px 19px;background:transparent;display:flex;flex-direction:column;align-items:flex-start}.stat-card+.stat-card:before{content:'';position:absolute;left:0;top:25px;bottom:25px;width:1px;background:rgba(255,255,255,.17)}.stat-icon{position:absolute;right:24px;top:24px;color:#d4b984;opacity:.85}.stat-label{color:rgba(255,255,255,.67);font-size:11px;letter-spacing:.5px}.stat-card strong{margin-top:11px;font-family:var(--serif);font-size:31px;line-height:1.2;font-weight:500;letter-spacing:-.7px}.stat-card strong small{font-family:var(--sans);font-size:13px;font-weight:400;margin-left:5px;color:#d8bf93}.stat-card .stat-money{font-family:var(--sans);font-size:25px;font-weight:500;letter-spacing:-.8px;margin-top:15px}.stat-foot{font-size:10px;color:rgba(255,255,255,.49);margin-top:auto;padding-top:8px;letter-spacing:.2px}.stat-sparkle{position:absolute;color:#d9bd87;font-size:13px;right:12px;bottom:11px}.section-title-row{display:flex;align-items:flex-end;justify-content:space-between;margin:55px 0 18px}.dark-eyebrow{color:var(--gold);margin-bottom:7px}.section-title{font-family:var(--serif);font-size:23px;font-weight:500;letter-spacing:-.8px;margin:0;color:#352b29}.section-aside{font-size:10px;color:#a1988f;padding-bottom:4px}.ranking-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:17px}.panel{background:#fffdfa;border:1px solid #eee9e1;border-radius:3px;padding:22px 23px 18px;box-shadow:0 4px 14px rgba(63,41,31,.025)}.panel-heading{display:flex;align-items:center;gap:11px;padding-bottom:16px;border-bottom:1px solid #f0ece6}.heading-icon{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;color:var(--gold);background:#f7f2e9}.heading-copy{flex:1}.heading-copy h2{margin:0 0 4px;font-family:var(--serif);font-size:14px;font-weight:600;color:#423634}.heading-copy p{margin:0;color:#a39a92;font-size:10px}.text-button{border:0;background:none;color:#8a7770;font-size:10px;cursor:pointer;padding:7px 0 7px 8px;white-space:nowrap;transition:color .2s}.text-button:hover{color:var(--wine)}.text-button span{color:var(--gold);margin-left:3px}.ranking-list{padding-top:14px}.rank-row{display:grid;grid-template-columns:28px minmax(74px,1fr) minmax(70px,1.15fr) 35px;align-items:center;gap:10px;min-height:30px}.rank-number{font-size:10px;color:#b9b1a7;font-weight:600}.rank-number.top-rank,.full-rank-number.top-rank{color:var(--gold)}.rank-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#514845;font-size:11px}.bar-track{height:4px;background:#f0ede7;border-radius:5px;overflow:hidden}.bar-fill{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,#9f5d53,#78282b);transition:width .4s ease}.rank-count{text-align:right;font-size:11px;font-weight:600;color:#66534b}.rank-count small,.full-rank-row small{font-size:9px;font-weight:400;color:#a59b90;margin-left:3px}.empty-inline{font-size:12px;color:#9b9187;padding:15px 0}.records-section{padding-bottom:18px}.records-heading{margin-top:54px;margin-bottom:16px}.record-count{font:11px var(--sans);display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;color:var(--wine);background:#f2eae1;margin-left:4px;vertical-align:3px}.sort-label{display:flex;align-items:center;gap:7px;color:#968b81;font-size:10px;padding-bottom:5px}.record-list{border-top:1px solid var(--line)}.record-card{width:100%;border:0;border-bottom:1px solid var(--line);background:transparent;padding:16px 10px;display:grid;grid-template-columns:70px minmax(180px,1fr) minmax(150px,.8fr) 105px 24px;align-items:center;text-align:left;gap:18px;cursor:pointer;transition:background .2s,padding .2s}.record-card:hover{background:#f8f5ef;padding-left:15px}.record-date{display:flex;flex-direction:column;gap:3px;border-right:1px solid #e8e1d7}.record-date span{font-size:9px;letter-spacing:.8px;color:#a1988f}.record-date strong{font-family:var(--serif);font-size:17px;font-weight:500;color:var(--wine)}.record-main{display:flex;flex-direction:column;gap:4px;min-width:0}.record-kicker{font-size:8px;color:var(--gold);letter-spacing:1.3px}.record-title{font-family:var(--serif);font-size:15px;font-weight:600;color:#3c302e}.record-cast{font-size:10px;color:#999087;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.record-venue{display:flex;align-items:center;gap:6px;color:#8c837a;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.record-venue :global(svg){flex:none;color:#b49a6d}.record-price{text-align:right;font-size:11px;color:#6b5b54;font-weight:500}.record-arrow{display:grid;place-items:center;color:#b7a792;transition:transform .2s,color .2s}.record-card:hover .record-arrow{transform:translateX(3px);color:var(--wine)}.empty-state{text-align:center;padding:40px 10px;border-bottom:1px solid var(--line);color:#968b81;font-size:12px}.footer{min-height:77px;border-top:1px solid var(--line);display:flex;align-items:center;gap:18px;color:#a0968d;font-size:10px}.footer-brand .brand-mark{width:25px;height:25px;font-size:12px}.footer-brand .brand-name{font-size:16px}.footer-year{margin-left:auto;letter-spacing:1.4px;font-size:8px}.modal-backdrop{position:fixed;inset:0;z-index:10;background:rgba(35,25,24,.47);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px);animation:fade-in .18s ease}.modal{position:relative;width:min(480px,100%);max-height:min(85vh,760px);overflow-y:auto;background:var(--paper);border:1px solid rgba(181,147,91,.35);padding:36px 38px 30px;box-shadow:0 24px 80px rgba(32,19,17,.24);animation:rise-in .2s ease}.detail-modal{width:min(590px,100%)}.modal-close{position:absolute;right:17px;top:16px;width:34px;height:34px;border:1px solid #e9e2d7;border-radius:50%;background:transparent;color:#887b72;display:grid;place-items:center;cursor:pointer}.modal-close:hover{color:var(--wine);border-color:#cdbb9c}.modal-title{font-family:var(--serif);font-size:25px;font-weight:500;letter-spacing:-.8px;margin:0;color:#382d2b}.modal-subtitle{font-size:11px;color:#9d9288;margin:8px 0 20px}.full-ranking-list{margin-top:18px;border-top:1px solid var(--line);padding-top:11px}.full-rank-row{display:grid;grid-template-columns:35px 1fr 1.1fr 35px;gap:12px;align-items:center;min-height:42px;border-bottom:1px solid #f0ece6}.full-rank-number{color:#b9b1a7;font-size:11px;font-weight:600}.full-rank-name{font-size:12px;color:#514845}.full-rank-row>strong{text-align:right;font-size:12px;color:#67564e}.modal-done{width:100%;margin-top:22px;height:42px;border:0;background:var(--wine);color:#fff;font-size:11px;letter-spacing:.4px;cursor:pointer;transition:background .2s}.modal-done:hover{background:var(--wine-dark)}.detail-date{display:flex;align-items:center;gap:7px;color:#92867c;font-size:11px;margin:10px 0 18px}.detail-date :global(svg){color:var(--gold)}.detail-divider{height:1px;background:var(--line);margin-bottom:17px}.detail-grid{display:grid;grid-template-columns:1fr 1fr;column-gap:24px}.detail-item{display:flex;flex-direction:column;gap:6px;padding:11px 0;border-bottom:1px solid #f0ece6;min-width:0}.detail-item span{font-size:9px;letter-spacing:.8px;color:#a69a8e}.detail-item strong{font-size:11px;line-height:1.6;font-weight:500;color:#554944;overflow-wrap:anywhere}.detail-item.full-width{grid-column:1/-1}.memo-box{margin-top:19px;padding:16px 17px;background:#f5f0e8;border-left:2px solid var(--gold)}.memo-box span{font-size:8px;letter-spacing:1.5px;color:#a08250}.memo-box p{font-family:var(--serif);font-size:12px;line-height:1.9;color:#635751;margin:8px 0 0;white-space:pre-wrap;overflow-wrap:anywhere}@keyframes fade-in{from{opacity:0}to{opacity:1}}@keyframes rise-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:760px){.container{width:min(100% - 36px,600px)}.topbar{height:68px}.topbar-note{font-size:9px;letter-spacing:.8px}.profile-chip>span:last-child{display:none}.hero{height:250px}.hero h1{font-size:30px}.hero-decoration{right:-135px;opacity:.48;transform:scale(.8)}.hero-caption{right:1px;bottom:18px;font-size:7px}.stats-grid{grid-template-columns:1fr}.stat-card{min-height:108px;padding:16px 20px}.stat-card+.stat-card:before{top:0;left:20px;right:20px;bottom:auto;width:auto;height:1px}.stat-icon{top:20px;right:21px}.stat-card strong{font-size:26px;margin-top:7px}.stat-card .stat-money{font-size:22px;margin-top:9px}.stat-foot{padding-top:4px}.section-title-row{margin-top:41px}.section-title{font-size:21px}.section-aside{font-size:9px}.ranking-grid{grid-template-columns:1fr;gap:12px}.panel{padding:18px}.records-heading{margin-top:43px}.record-card{grid-template-columns:54px minmax(120px,1fr) 22px;gap:12px;padding:14px 5px}.record-venue,.record-price{display:none}.record-date strong{font-size:15px}.record-title{font-size:14px}.record-arrow{grid-column:3;grid-row:1}.footer{min-height:68px;gap:10px;font-size:9px}.footer-brand{gap:7px}.footer-year{font-size:7px}}
        @media(max-width:420px){.container{width:calc(100% - 28px)}.topbar-note{font-size:8px}.hero{height:230px}.hero h1{font-size:27px}.hero-description{font-size:11px}.hero-decoration{right:-170px;opacity:.38}.section-aside{max-width:112px;text-align:right;line-height:1.6}.panel{padding:16px 14px}.heading-copy h2{font-size:13px}.rank-row{grid-template-columns:24px minmax(68px,1fr) minmax(55px,1.1fr) 30px;gap:7px}.record-card{grid-template-columns:48px minmax(100px,1fr) 20px;gap:9px}.record-cast{font-size:9px}.footer>span:nth-child(2){font-size:8px}.modal{padding:32px 22px 23px}.detail-grid{column-gap:15px}.full-rank-row{grid-template-columns:29px 1fr .9fr 30px;gap:8px}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;transition-duration:.01ms!important}}
      `}</style>
    </main>
  );
}
