import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Icon from '../../components/icons/Icon';
import styles from './SpecialPropsEditor.module.css';

interface SpecialPropsEditorProps {
  isPublishing: boolean;
  onAdd: (title: string, value: string) => void;
}

const SpecialPropsEditor = ({ isPublishing, onAdd }: SpecialPropsEditorProps) => {
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const handleAdd = () => {
    if (!title.trim() || !value.trim()) return;
    onAdd(capitalize(title.trim()), capitalize(value.trim()));
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
        <Icon name="plus" style={{ margin: '0 8px' }} /> Legg til ny nokkelinfo
      </Button>

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
                <Icon name="plus" style={{ margin: '0 8px' }} /> Legg til nokkelinfo
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
