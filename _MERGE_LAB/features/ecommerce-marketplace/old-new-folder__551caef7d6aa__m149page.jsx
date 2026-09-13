import React, { useEffect, useState } from 'react';
import './styles.css';
import { protectedCultivationAPI } from '../../services/api';

export default function M149Page(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    protectedCultivationAPI.getStructures()
      .then(({ data }) => {
        if (active && data?.success) setItems(Array.isArray(data.data) ? data.data : []);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return (<div className='module-M149 p-4'>
    <h1>M149 Module</h1>
    {loading? <div>Loading…</div> : (
      <ul>{items.map(it => <li key={it.id}>{JSON.stringify(it.data)}</li>)}</ul>
    )}
  </div>);
}