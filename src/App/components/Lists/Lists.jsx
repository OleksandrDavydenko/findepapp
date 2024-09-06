import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase'; // Імпортуємо Firestore
import './lists.css'; // Стилі для списку

const DirectoryList = ({ collectionName, headers, renderRow, CardComponent, entityName }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: headers[0].key, direction: 'asc' });

  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const loadedItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(loadedItems);
    };

    fetchItems();
  }, [collectionName]);

  const sortedItems = [...items].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAdd = () => {
    setIsAdding(true);
    setSelectedItem(null);
  };

  const handleEdit = () => {
    if (selectedItem) {
      setIsAdding(true);
    }
  };

  const handleDelete = async () => {
    if (selectedItem) {
      const isConfirmed = window.confirm(`Ви впевнені, що хочете видалити ${entityName} ${selectedItem.name}?`);
      if (isConfirmed) {
        await deleteDoc(doc(db, collectionName, selectedItem.id));
        setItems(items.filter(item => item.id !== selectedItem.id));
        setSelectedItem(null);
      }
    }
  };

  const handleSave = async (newItem) => {
    if (selectedItem) {
      const itemDoc = doc(db, collectionName, selectedItem.id);
      await updateDoc(itemDoc, newItem);

      setItems(prevItems =>
        prevItems.map(item =>
          item.id === selectedItem.id ? { ...item, ...newItem } : item
        )
      );
    } else {
      const docRef = await addDoc(collection(db, collectionName), newItem);
      setItems([...items, { id: docRef.id, ...newItem }]);
    }
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
  };

  const handleRowDoubleClick = (item) => {
    setSelectedItem(item);
    setIsAdding(true);
  };

  const filteredItems = sortedItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isAdding) {
    return (
      <CardComponent
        item={selectedItem}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="directory-list-container">
      <h2>{entityName}</h2>
      <input
        type="text"
        placeholder={`Пошук по назві ${entityName.toLowerCase()}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <div className="actions">
        <button onClick={handleAdd}>Додати</button>
        <button onClick={handleEdit} disabled={!selectedItem}>Змінити</button>
        <button onClick={handleDelete} disabled={!selectedItem}>Видалити</button>
      </div>
      <div className="table-container">
        <table className="directory-table">
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header.key} onClick={() => handleSort(header.key)}>
                  {header.label} {sortConfig.key === header.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                className={selectedItem && selectedItem.id === item.id ? 'selected' : ''}
                onClick={() => handleRowClick(item)}
                onDoubleClick={() => handleRowDoubleClick(item)}
              >
                {renderRow(item)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DirectoryList;
