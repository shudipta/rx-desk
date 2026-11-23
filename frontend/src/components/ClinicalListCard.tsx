import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Button, Card, Col, Input, Row, Space, Tag, Typography } from 'antd'
import type { InputRef } from 'antd'
import { CheckOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import type { ClinicalTemplate } from '../types/template'

interface Props {
  title: ReactNode
  /** Tag colour for quick picks */
  color: string
  items: string[]
  onChange: (items: string[]) => void
  templates: ClinicalTemplate[]
  placeholder: string
}

/** A template ending in ":" (e.g. "BP:") is a label the doctor completes with a value. */
const isPrefix = (text: string) => text.trim().endsWith(':')

/**
 * One list section of the prescription form (C/C, P/H, O/E, Diagnosis):
 * one line per entry, Enter adds a line, and quick-pick tags from the
 * doctor's templates. A plain tag toggles; a "BP:"-style tag inserts the
 * label and puts the cursor after it for the value.
 */
function ClinicalListCard({ title, color, items, onChange, templates, placeholder }: Props) {
  const inputRefs = useRef<(InputRef | null)[]>([])
  const [focusIndex, setFocusIndex] = useState<number | null>(null)

  useEffect(() => {
    if (focusIndex === null) return
    inputRefs.current[focusIndex]?.focus({ cursor: 'end' })
    setFocusIndex(null)
  }, [focusIndex, items])

  const setItem = (index: number, value: string) =>
    onChange(items.map((x, i) => (i === index ? value : x)))

  const insertAfter = (index: number) => {
    const next = [...items]
    next.splice(index + 1, 0, '')
    onChange(next)
    setFocusIndex(index + 1)
  }

  const remove = (index: number) => onChange(items.filter((_, i) => i !== index))

  // Put text into the trailing empty line if there is one, otherwise append.
  const insert = (text: string): number => {
    const last = items.length - 1
    if (last >= 0 && !items[last].trim()) {
      onChange(items.map((x, i) => (i === last ? text : x)))
      return last
    }
    onChange([...items, text])
    return items.length
  }

  const isSelected = (t: ClinicalTemplate) =>
    isPrefix(t.text)
      ? items.some((x) => x.trim().startsWith(t.text.trim()))
      : items.some((x) => x.trim() === t.text.trim())

  const pick = (t: ClinicalTemplate) => {
    const text = t.text.trim()
    if (isPrefix(text)) {
      // Never delete a typed value on a click: jump to the existing line instead.
      const existing = items.findIndex((x) => x.trim().startsWith(text))
      setFocusIndex(existing >= 0 ? existing : insert(`${text} `))
      return
    }
    if (isSelected(t)) onChange(items.filter((x) => x.trim() !== text))
    else insert(text)
  }

  return (
    <Card
      title={<span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>}
      style={{ borderRadius: 16, marginBottom: 20, height: 'calc(100% - 20px)' }}
      bodyStyle={{ padding: '12px 16px' }}
      extra={
        <Button type="dashed" icon={<PlusOutlined />} size="small" onClick={() => insertAfter(items.length - 1)}>
          Add
        </Button>
      }
    >
      {templates.length > 0 && (
        <Space size={4} wrap style={{ marginBottom: 10 }}>
          {templates.map((t) => {
            const selected = isSelected(t)
            return (
              <Tag
                key={t.id}
                color={selected ? color : undefined}
                style={{ cursor: 'pointer', margin: 0, fontSize: 12, padding: '1px 8px' }}
                onClick={() => pick(t)}
              >
                {selected ? <CheckOutlined /> : <PlusOutlined />} {t.text}
              </Tag>
            )
          })}
        </Space>
      )}

      {items.map((value, i) => (
        <Row key={i} gutter={6} style={{ marginBottom: 6 }} wrap={false}>
          <Col flex="auto">
            <Input
              ref={(el) => {
                inputRefs.current[i] = el
              }}
              value={value}
              onChange={(e) => setItem(i, e.target.value)}
              onPressEnter={() => insertAfter(i)}
              onKeyDown={(e) => {
                // Backspace on an empty line removes it and returns to the line above
                if (e.key === 'Backspace' && !value && items.length > 1) {
                  e.preventDefault()
                  remove(i)
                  setFocusIndex(Math.max(0, i - 1))
                }
              }}
              placeholder={placeholder}
              size="small"
            />
          </Col>
          <Col>
            <Button icon={<MinusCircleOutlined />} danger type="text" size="small" onClick={() => remove(i)} />
          </Col>
        </Row>
      ))}

      {items.length === 0 && (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Click a tag or "Add"
        </Typography.Text>
      )}
    </Card>
  )
}

export default ClinicalListCard
