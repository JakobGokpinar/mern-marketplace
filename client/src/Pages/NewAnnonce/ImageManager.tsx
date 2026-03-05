import { useRef, DragEvent } from 'react';
import styles from './ImageManager.module.css';
import type { AnnonceImage } from './types';

interface ImageManagerProps {
  imageArray: AnnonceImage[];
  onDelete: (name: string) => void;
  onDescriptionChange: (name: string, description: string) => void;
  onReorder: (images: AnnonceImage[]) => void;
}

const ImageManager = ({ imageArray, onDelete, onDescriptionChange, onReorder }: ImageManagerProps) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (_e: DragEvent<HTMLLIElement>, index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (_e: DragEvent<HTMLLIElement>, index: number) => {
    dragOverItem.current = index;
  };

  const handleDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const reordered = [...imageArray];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, moved);
    dragItem.current = null;
    dragOverItem.current = null;
    onReorder(reordered);
  };

  if (imageArray.length === 0) return null;

  return (
    <ul className={styles['list']}>
      {imageArray.map((item, index) => (
        <li
          key={item.name}
          className={styles['item']}
          draggable
          onDragStart={e => handleDragStart(e, index)}
          onDragEnter={e => handleDragEnter(e, index)}
          onDragEnd={handleDrop}
        >
          {/* drag handle */}
          <span className={styles['handle']} title="Dra for å sortere">
            <i className="fa-solid fa-grip-vertical" />
          </span>

          {/* thumbnail + cover badge */}
          <div className={styles['thumb-wrap']}>
            <img
              className={styles['thumb']}
              src={item.data ?? item.location}
              alt="product"
            />
            {index === 0 && <span className={styles['cover-badge']}>Forside</span>}
          </div>

          {/* caption input */}
          <div className={styles['caption-wrap']}>
            <label className={styles['caption-label']}>Bildetekst</label>
            <input
              type="text"
              className={styles['caption-input']}
              value={item.description}
              placeholder="Valgfri bildetekst..."
              onChange={e => onDescriptionChange(item.name, e.target.value)}
            />
          </div>

          {/* delete */}
          <button
            type="button"
            className={styles['delete-btn']}
            onClick={() => onDelete(item.name)}
            title="Slett bilde"
            aria-label="Slett bilde"
          >
            <i className="fa-solid fa-trash-can" />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ImageManager;
