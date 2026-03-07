import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import styles from './SpecialPropsEditor.module.css';

interface SpecialPropsEditorProps {
  isPublishing: boolean;
  onAdd: (title: string, value: string) => void;
}

const SpecialPropsEditor = ({ isPublishing, onAdd }: SpecialPropsEditorProps) => {
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');

  const handleAdd = () => {
    if (!title.trim() || !value.trim()) return;
    onAdd(title.trim(), value.trim());
    setTitle('');
    setValue('');
    setShowBackdrop(false);
  };

  return (
    <div className={styles['editor-row']}>
      <Button
        variant="outline-primary"
        className="w-100"
        type="button"
        onClick={() => setShowBackdrop(true)}
        disabled={isPublishing}
      >
        <i className="fa-solid fa-plus mx-2" /> Legg til ny nokkelinfo
      </Button>
      <OverlayTrigger
        placement="right"
        overlay={<Tooltip>Legg til raske fakta om produktet ditt.</Tooltip>}
      >
        <i className="fa-solid fa-circle-question mx-3" />
      </OverlayTrigger>

      {showBackdrop && (
        <div className={styles['backdrop']} onClick={() => setShowBackdrop(false)}>
          <div className={styles['backdrop-panel']} onClick={e => e.stopPropagation()}>
            <FloatingLabel label="Overskrift" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Overskrift"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </FloatingLabel>
            <FloatingLabel label="Input" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Input"
                value={value}
                onChange={e => setValue(e.target.value)}
              />
            </FloatingLabel>
            <div className="d-flex gap-3 mt-4">
              <Button variant="outline-primary" type="button" className="w-75" onClick={handleAdd}>
                <i className="fa-solid fa-plus mx-2" /> Legg til nokkelinfo
              </Button>
              <Button variant="outline-dark" type="button" className="w-25" onClick={() => setShowBackdrop(false)}>
                Lukk
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialPropsEditor;
