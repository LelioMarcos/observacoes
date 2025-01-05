import { Button, Group, NumberInput, Text } from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import { useState } from "react";

function EditableNumberInput({ text, valueOri, onChangeHandler }) {
    const [element, setElement] = useState(false);
    const [value, setValue] = useState(valueOri);

    return (
        <Group grow wrap="nowrap" justify="space-between">
            {element ? (
                <NumberInput
                    w={100}
                    min={0}
                    prefix="R$"
                    size="xs"
                    decimalScale={2}
                    fixedDecimalScale
                    decimalSeparator=","
                    value={value}
                    step={0.01}
                    onChange={(val) => setValue(val)}
                />
                ) : (
                    <Text size="xs">{text} R${value.toFixed(2)}</Text>
                )}   
            <Button size="xs" onClick={() => {
                setElement(!element)
                {element ? onChangeHandler(value) : <></>}
            }

            }>{element ?
                <Text size="xs">Salvar</Text> :
                <Text size="xs">Editar</Text>
            }</Button> 
        </Group>
    )
}

export default EditableNumberInput;