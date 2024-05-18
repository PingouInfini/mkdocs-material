# Reuse

## Inclusion de la partie 'tip' de la page 1

!!! question "comment faire?"
    Inclusion d'une partie d'un autre .md dans la page actuelle (ici page1.md, § 'tip') en rajoutant dans une page  
    `{%`  
        `include-markdown 'general/page1.md'`  
        `start="<!--tip-start-->"`  
        `end="<!--tip-end-->"`    
    `%}`  
    

??? info "Résultat"
    {%
        include-markdown 'general/page1.md'
        start="<!--tip-start-->"
        end="<!--tip-end-->"
    %}

!!! success
    Félicitation
