import React from 'react';
import '../styles/Features.css';

const featuresData = [
  {
    icon: '🪙',
    title: 'Mint & Trade NFTs',
    description: 'Create, list, update, cancel, and trade NFTs in our powerful decentralized marketplace. Buy and sell with full control.',
  },
  {
    icon: '🌐',
    title: 'List Any NFT',
    description: 'Support for both physical and digital NFTs. Upload any file — from code, audio, video, to art and photography.',
  },
  {
    icon: '📦',
    title: 'Escrow-Backed Tracking',
    description: 'Physical items are secured with our smart contract escrow-based tracking system, ensuring safe and trustless delivery.',
  },
  {
    icon: '🎨',
    title: 'Support for All Media',
    description: 'Upload anything: code, music, videos, 3D models, images, or documents — we support all creative formats.',
  }
];

const Features = () => {
  return (
    <>
    <h1 className="home2-heading"> <span style={{color:"orange"}}>Why</span> Choose DeMa ?</h1>
    <p className="home2-paragraph">Built for real creators. Powered by trust and freedom.</p>
    <section className="features-container">
      <div className="features-grid">
        {featuresData.map((feature, index) => (
          <div key={index} className="features-card">
            <div className="features-icon">{feature.icon}</div>
            <h3 className="features-card-title">{feature.title}</h3>
            <p className="features-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
    </>
  );
};

export default Features;
